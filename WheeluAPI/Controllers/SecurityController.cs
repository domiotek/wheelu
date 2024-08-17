using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WheeluAPI.DTO;
using WheeluAPI.DTO.Errors;
using WheeluAPI.DTO.User;
using WheeluAPI.helpers;
using WheeluAPI.Services;

namespace WheeluAPI.Controllers;

[ApiController]
[Route("/api/v1/auth")]
public class SecurityController(IJwtHandler jwtHandler, IUserService service) : BaseAPIController {

	[HttpPost("signup")]
	[ProducesResponseType(StatusCodes.Status201Created)]
	[ProducesResponseType(typeof(APIError), StatusCodes.Status400BadRequest)]
	[Produces("application/json")]
	public async Task<IActionResult> CreateStudentAccount([FromBody] UserSignUpRequest requestData) {
		var result = await service.CreateAccountAsync(requestData, UserRole.Student);

		if(result.IsSuccess && result.User != null) {
			var deliveryResult = await service.SendActivationEmailAsync(result.User, "confirm-registration");
			
			if(!deliveryResult.IsSuccess) {
				await service.DeleteUserAsync(result.User);
				return BadRequest(new APIError<UserSignUpErrorCode> {Code = UserSignUpErrorCode.EmailDeliveryProblem, Details = [deliveryResult.ErrorCode.ToString()]});
			}
			return StatusCode(201);
		}

		return BadRequest(new APIError<UserSignUpErrorCode> {Code = result.ErrorCode, Details = result.Details});
	}

	[HttpPost("signin")]
	[ProducesResponseType(typeof(UserSignInResponse), StatusCodes.Status200OK)]
	[ProducesResponseType(typeof(APIError), StatusCodes.Status401Unauthorized)]
	[ProducesResponseType(typeof(APIError), StatusCodes.Status400BadRequest)]
	[ProducesResponseType(StatusCodes.Status400BadRequest)]
	[Produces("application/json")]
	public async Task<IActionResult> Login([FromBody] UserSignInRequest requestData) {

		var result = await service.TrySignInAsync(requestData);
		if(result.IsSuccess) {
			var token = await jwtHandler.GenerateJwtToken(requestData.Username);

			return Ok(new UserSignInResponse {Token = token});
		}

		if(result.ErrorCode == UserSignInErrorCode.AccountNotActivated) 
			return BadRequest(new APIError<UserSignInErrorCode> {Code = UserSignInErrorCode.AccountNotActivated});

		return Unauthorized(new APIError<UserSignInErrorCode> {Code=UserSignInErrorCode.InvalidCredentials});
	}

	
	[HttpGet("identify")]
	[ProducesResponseType(typeof(UserIdentifyResponse), StatusCodes.Status200OK)]
	[ProducesResponseType(StatusCodes.Status401Unauthorized)]
	[ProducesResponseType(typeof(APIError), StatusCodes.Status400BadRequest)]
	[Produces("application/json")]
	[Authorize]
	public async Task<IActionResult> IdentifyUser() {

		var userID = User.FindFirstValue(ClaimTypes.NameIdentifier);

		var user = await service.GetUserByEmailAsync(userID ?? "");

		if(user==null) return BadRequest(new APIError {Code=APIErrorCode.UnexpectedError, Details=["Invalid user"]});

		var roles = User.Claims
                    .Where(c => c.Type == ClaimTypes.Role)
                    .Select(c => c.Value)
                    .ToList();

		return Ok(new UserIdentifyResponse {UserId=user.Id, Name=user.Name, Surname=user.Surname, Role=roles[0]});
	}

	[HttpPost("resend-activation")]
	[ProducesResponseType(typeof(UserIdentifyResponse), StatusCodes.Status200OK)]
	public async Task<IActionResult> ResendActivationEmail([FromBody] ActivationResendRequest data) {
		var user = await service.GetUserByEmailAsync(data.Email);

		if(user == null) {
			await Task.Delay(2000);	
			return Ok();
		}

		await service.SendActivationEmailAsync(user,"confirm-registration");

		return Ok();
	}

	[HttpPost("activate-account")]
	[ProducesResponseType(typeof(UserIdentifyResponse), StatusCodes.Status200OK)]
	[ProducesResponseType(typeof(APIError), StatusCodes.Status400BadRequest)]
	public async Task<IActionResult> ActivateAccount([FromBody] ActivationRequest data) {

		var result = await service.ActivateAccountAsync(data.Token);

		if(!result.IsSuccess)
			return BadRequest(new APIError<ActivationTokenValidationErrors> {Code = result.ErrorCode});


		return Ok();
	}
}
