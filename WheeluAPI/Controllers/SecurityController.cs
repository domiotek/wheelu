using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WheeluAPI.DTO;
using WheeluAPI.helpers;
using WheeluAPI.models;

namespace WheeluAPI.Controllers;

[ApiController]
[Route("/api/v1/auth")]
public class SecurityController(UserManager<User> users, SignInManager<User> signInManager, IJwtHandler jwtHandler) : BaseAPIController {

	[HttpPost("signup")]
	[ProducesResponseType(StatusCodes.Status201Created)]
	[ProducesResponseType(StatusCodes.Status400BadRequest)]
	[Produces("application/json")]
	public async Task<IActionResult> CreateStudentAccount([FromBody] UserSignUpRequest requestData) {
		var newUser = new User {
			Email = requestData.Username,
			UserName = requestData.Username,
			Name = requestData.Name,
			Surname = requestData.Surname,
			CreatedAt = DateTime.UtcNow
		};

		var result = await users.CreateAsync(newUser, requestData.Password);

		if(result.Succeeded) {
			result = await users.AddToRoleAsync(newUser, UserRole.Student.ToString());

			if(result.Succeeded) return StatusCode(201);
			else await users.DeleteAsync(newUser);
		}

		var errorCodes = new List<string>();

		var passwordValid = true;

		foreach(var error in result.Errors) {
			if(error.Code.Contains("Password"))
				passwordValid = false;
			
			errorCodes.Add(error.Code);
		}

		if(!passwordValid)
			return BadRequest(new APIError<UserSignUpErrorCode> {Code=UserSignUpErrorCode.PasswordRequirementsNotMet, Details=errorCodes});

		if(errorCodes.Contains("DuplicateUserName"))
			return BadRequest(new APIError<UserSignUpErrorCode> {Code=UserSignUpErrorCode.EmailAlreadyTaken});

		return BadRequest(new APIError {Code=APIErrorCode.UnexpectedError, Details=errorCodes});
	}

	[HttpPost("signin")]
	[ProducesResponseType(typeof(UserSignInResponse), StatusCodes.Status200OK)]
	[ProducesResponseType(typeof(APIError), StatusCodes.Status401Unauthorized)]
	[ProducesResponseType(StatusCodes.Status400BadRequest)]
	[Produces("application/json")]
	public async Task<IActionResult> Login([FromBody] UserSignInRequest requestData) {
		var result = await signInManager.PasswordSignInAsync(
			requestData.Username, 
			requestData.Password, 
			requestData.RememberMe, 
			lockoutOnFailure: false
		);

		if(result.Succeeded) {
			var token = await jwtHandler.GenerateJwtToken(requestData.Username);

			return Ok(new UserSignInResponse {Token = token});
		}

		return Unauthorized(new APIError<UserSignInErrorCode> {Code=UserSignInErrorCode.InvalidCredentials});
	}

	
	[HttpGet("identify")]
	[ProducesResponseType(typeof(UserIdentifyResponse), StatusCodes.Status200OK)]
	[ProducesResponseType(StatusCodes.Status401Unauthorized)]
	[ProducesResponseType(typeof(APIError), StatusCodes.Status400BadRequest)]
	[Produces("application/json")]
	[Authorize]
	public async Task<IActionResult> IdentifyUser() {
		
		bool isAdmin = User.IsInRole("Administrator");

		var userID = User.FindFirstValue(ClaimTypes.NameIdentifier);

		var user = await users.FindByEmailAsync(userID ?? "-1");

		if(user==null) return BadRequest(new APIError {Code=APIErrorCode.UnexpectedError, Details=["Invalid user"]});

		var roles = User.Claims
                    .Where(c => c.Type == ClaimTypes.Role)
                    .Select(c => c.Value)
                    .ToList();

		return Ok(new UserIdentifyResponse {UserId=user.Id, Name=user.Name, Surname=user.Surname, Role=roles[0]});
	}
}
