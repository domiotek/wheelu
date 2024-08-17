using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WheeluAPI.DTO;
using WheeluAPI.DTO.Errors;
using WheeluAPI.DTO.User;
using WheeluAPI.helpers;
using WheeluAPI.Mail.Templates;
using WheeluAPI.models;

namespace WheeluAPI.Services;

public class UserService(UserManager<User> users, SignInManager<User> signInManager, IMailService mailService, ApplicationDbContext dbContext): IUserService {
	public async Task<UserCreationResult> CreateAccountAsync(UserSignUpRequest requestData, UserRole role) {
		var newUser = new User {
			Email = requestData.Username,
			UserName = requestData.Username,
			Name = requestData.Name,
			Surname = requestData.Surname,
			CreatedAt = DateTime.UtcNow,
		};

		var result = await users.CreateAsync(newUser, requestData.Password);

		if(result.Succeeded) {
			result = await users.AddToRoleAsync(newUser, role.ToString());

			if(result.Succeeded) return new UserCreationResult {IsSuccess = true, User = newUser};
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
			return new UserCreationResult { ErrorCode = UserSignUpErrorCode.PasswordRequirementsNotMet, Details = errorCodes};

		if(errorCodes.Contains("DuplicateUserName"))
			return new UserCreationResult { ErrorCode = UserSignUpErrorCode.EmailAlreadyTaken};

		return new UserCreationResult { Details = errorCodes };
	}

	public Task<User?> GetUserByIDAsync(string userID) {
		return users.FindByIdAsync(userID);
	}

	public Task<User?> GetUserByEmailAsync(string email) {
		return users.FindByEmailAsync(email);
	}

	public async Task<bool> DeleteUserAsync(User user) {
		var result = await users.DeleteAsync(user);
		return result.Succeeded;
	}

	public async Task<ServiceActionResult<UserSignInErrorCode>> TrySignInAsync(UserSignInRequest requestData) {
		var result = await signInManager.PasswordSignInAsync(
			requestData.Username, 
			requestData.Password, 
			requestData.RememberMe, 
			lockoutOnFailure: false
		);

		if(!result.Succeeded) return new ServiceActionResult<UserSignInErrorCode> {ErrorCode = UserSignInErrorCode.InvalidCredentials};

		var user = await users.FindByEmailAsync(requestData.Username);

		if(user?.EmailConfirmed == false) return new ServiceActionResult<UserSignInErrorCode> {ErrorCode = UserSignInErrorCode.AccountNotActivated};

		return new ServiceActionResult<UserSignInErrorCode> {IsSuccess = true};
	}

	public async Task<ActivationTokenFetchResult> GetActivationTokenASync(User user) {
		if(user.EmailConfirmed) return new ActivationTokenFetchResult {ErrorCode = ActivationTokenFetchErrors.AlreadyActivated};

		var existingToken = await dbContext.ActivationTokens.Include(t=>t.User).Where(t=>t.User.Id == user.Id).SingleOrDefaultAsync();

		if(existingToken != null) {
			if(DateTime.UtcNow <= existingToken.CreatedAt.AddHours(24))
				return new ActivationTokenFetchResult {IsSuccess = true, Token = existingToken};

			dbContext.ActivationTokens.Remove(existingToken);
		}

		var newToken = new ActivationToken() {
			Id = Guid.NewGuid(),
			User = user,
			CreatedAt = DateTime.UtcNow
		};

		dbContext.ActivationTokens.Add(newToken);

		var written = await dbContext.SaveChangesAsync();

		return written > 0?
			new ActivationTokenFetchResult {IsSuccess = true, Token = newToken}
			:
			new ActivationTokenFetchResult {ErrorCode = ActivationTokenFetchErrors.DBError};
	}

	public async Task<ServiceActionResult<SendActivationEmailErrorCodes>> SendActivationEmailAsync(User user, string templateID) {
		var template = mailService.GetTemplate<ConfirmRegistrationTemplateVariables>(templateID);

		if(template == null) 
			return new ServiceActionResult<SendActivationEmailErrorCodes> {};

		var tokenFetchResult = await GetActivationTokenASync(user);

		if(!tokenFetchResult.IsSuccess) 
			return new ServiceActionResult<SendActivationEmailErrorCodes> {ErrorCode = (SendActivationEmailErrorCodes)tokenFetchResult.ErrorCode };

		var templateData = new ConfirmRegistrationTemplateVariables {
			Link = $"http://localhost:5173/activate-account?token={tokenFetchResult?.Token?.Id}"
		};

		if(await mailService.SendEmail("accounts",template.Populate(templateData), [user.Email]) == false)
			return new ServiceActionResult<SendActivationEmailErrorCodes> {ErrorCode = SendActivationEmailErrorCodes.MailServiceProblem};
		
		return new ServiceActionResult<SendActivationEmailErrorCodes> {IsSuccess = true};
	}
}

public interface IUserService {
	Task<UserCreationResult> CreateAccountAsync(UserSignUpRequest requestData, UserRole role);

	Task<ServiceActionResult<SendActivationEmailErrorCodes>> SendActivationEmailAsync(User user, string templateID);

	Task<ActivationTokenFetchResult> GetActivationTokenASync(User user);

	Task<ServiceActionResult<UserSignInErrorCode>> TrySignInAsync(UserSignInRequest requestData);

	Task<User?> GetUserByIDAsync(string userID);

	Task<User?> GetUserByEmailAsync(string email);

	Task<bool> DeleteUserAsync(User user);
}