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
	public async Task<UserCreationResult> CreateAccountAsync(UserSignUpRequest requestData, UserRole role, bool createActivated=false) {
		var newUser = new User {
			Email = requestData.Username,
			UserName = requestData.Username,
			Name = requestData.Name,
			Surname = requestData.Surname,
			Birthday = requestData.Birthday,
			CreatedAt = DateTime.UtcNow,
			EmailConfirmed = createActivated
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

	public async Task<AccountToken?> GetAccountTokenAsync(User user, AccountTokenType tokenType) {

		var existingToken = await dbContext.AccountTokens
			.Include(t=>t.User)
			.Where(t=>t.User.Id == user.Id)
			.Where(t=>t.TokenType==tokenType)
			.SingleOrDefaultAsync();

		if(existingToken != null) {
			if(DateTime.UtcNow <= existingToken.CreatedAt.AddHours(24))
				return existingToken;

			dbContext.AccountTokens.Remove(existingToken);
		}

		var newToken = new AccountToken() {
			Id = Guid.NewGuid(),
			TokenType = tokenType,
			User = user,
			CreatedAt = DateTime.UtcNow
		};

		dbContext.AccountTokens.Add(newToken);

		var written = await dbContext.SaveChangesAsync();

		return written > 0? newToken : null;
	}

	public async Task<ServiceActionResult<SendActivationEmailErrorCodes>> SendActivationEmailAsync(User user, string templateID) {
		var template = mailService.GetTemplate<ConfirmRegistrationTemplateVariables>(templateID);

		if(template == null) 
			return new ServiceActionResult<SendActivationEmailErrorCodes> {};

		if(user.EmailConfirmed)
			return new ServiceActionResult<SendActivationEmailErrorCodes> {ErrorCode = SendActivationEmailErrorCodes.AlreadyActivated };

		var token = await GetAccountTokenAsync(user, AccountTokenType.ActivationToken);

		if(token==null) 
			return new ServiceActionResult<SendActivationEmailErrorCodes> {ErrorCode = SendActivationEmailErrorCodes.DBError };

		var templateData = new ConfirmRegistrationTemplateVariables {
			Link = $"http://localhost:5173/activate-account?token={token?.Id}"
		};

		if(await mailService.SendEmail("accounts",template.Populate(templateData), [user.Email]) == false)
			return new ServiceActionResult<SendActivationEmailErrorCodes> {ErrorCode = SendActivationEmailErrorCodes.MailServiceProblem};
		
		return new ServiceActionResult<SendActivationEmailErrorCodes> {IsSuccess = true};
	}

	public async Task<ServiceActionResult<ActivationTokenValidationErrors>> ActivateAccountAsync(string tokenID) {
		var token = dbContext.AccountTokens.Include(t=>t.User).FirstOrDefault(t=>t.Id == Guid.Parse(tokenID));

		if(token == null || DateTime.UtcNow > token.CreatedAt.AddHours(24))
			return new ServiceActionResult<ActivationTokenValidationErrors> {ErrorCode = ActivationTokenValidationErrors.InvalidToken};

		token.User.EmailConfirmed = true;

		dbContext.Users.Update(token.User);
		dbContext.AccountTokens.Remove(token);

		var written = await dbContext.SaveChangesAsync();

		if(written != 2) 
			return new ServiceActionResult<ActivationTokenValidationErrors> {ErrorCode = ActivationTokenValidationErrors.DBError};
		
		return new ServiceActionResult<ActivationTokenValidationErrors> {IsSuccess = true};
	}
}

public interface IUserService {
	Task<UserCreationResult> CreateAccountAsync(UserSignUpRequest requestData, UserRole role, bool createActivated=false);

	Task<ServiceActionResult<SendActivationEmailErrorCodes>> SendActivationEmailAsync(User user, string templateID);

	Task<AccountToken?> GetAccountTokenAsync(User user, AccountTokenType tokenType);

	Task<ServiceActionResult<ActivationTokenValidationErrors>> ActivateAccountAsync(string tokenID);

	Task<ServiceActionResult<UserSignInErrorCode>> TrySignInAsync(UserSignInRequest requestData);

	Task<User?> GetUserByIDAsync(string userID);

	Task<User?> GetUserByEmailAsync(string email);

	Task<bool> DeleteUserAsync(User user);
}