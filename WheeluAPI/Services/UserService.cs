using System.Transactions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WheeluAPI.DTO;
using WheeluAPI.DTO.Errors;
using WheeluAPI.DTO.User;
using WheeluAPI.helpers;
using WheeluAPI.Mail.Templates;
using WheeluAPI.models;

namespace WheeluAPI.Services;

public class UserService(
    UserManager<User> users,
    SignInManager<User> signInManager,
    IMailService mailService,
    ApplicationDbContext dbContext
) : BaseService, IUserService
{
    private static List<string> ExtractIdentityErrors(IEnumerable<IdentityError> errors)
    {
        return errors.Select(e => e.Code).ToList();
    }

    public async Task<UserCreationResult> CreateAccountAsync(
        UserSignUpRequest requestData,
        UserRole role,
        bool createActivated = false
    )
    {
        var newUser = new User
        {
            Email = requestData.Username,
            UserName = requestData.Username,
            Name = requestData.Name,
            Surname = requestData.Surname,
            Birthday = requestData.Birthday,
            CreatedAt = DateTime.UtcNow,
            EmailConfirmed = createActivated,
            LastPasswordChange = DateTime.UtcNow,
            Rides = [],
        };

        var result = await users.CreateAsync(newUser, requestData.Password);

        if (result.Succeeded)
        {
            result = await users.AddToRoleAsync(newUser, role.ToString());

            if (result.Succeeded)
                return new UserCreationResult { IsSuccess = true, User = newUser };
            else
                await users.DeleteAsync(newUser);
        }

        var errorCodes = ExtractIdentityErrors(result.Errors);

        var passwordValid = errorCodes.Find(c => c.Contains("Password")) == null;

        if (!passwordValid)
            return new UserCreationResult
            {
                ErrorCode = UserSignUpErrorCode.PasswordRequirementsNotMet,
                Details = errorCodes,
            };

        if (errorCodes.Contains("DuplicateUserName"))
            return new UserCreationResult { ErrorCode = UserSignUpErrorCode.EmailAlreadyTaken };

        return new UserCreationResult { Details = errorCodes };
    }

    public Task<User?> GetUserByIDAsync(string userID)
    {
        return users.FindByIdAsync(userID);
    }

    public Task<User?> GetUserByEmailAsync(string email)
    {
        return users.FindByEmailAsync(email);
    }

    public Task<List<User>> GetAllUsersAsync()
    {
        return dbContext.Users.ToListAsync();
    }

    public IQueryable<User> GetUsersAsync(PagingMetadata meta, out int appliedPageSize)
    {
        var results = ApplyPaging(dbContext.Users.AsQueryable(), meta, out int actualPageSize);

        appliedPageSize = actualPageSize;

        return results;
    }

    public Task<int> Count()
    {
        return dbContext.Users.CountAsync();
    }

    public async Task<bool> HasRole(User user, UserRole roleName)
    {
        return await users.IsInRoleAsync(user, roleName.ToString());
    }

    public async Task<bool> UpdateUser(User user, UpdateUserRequest data)
    {
        if (data.Name != null)
            user.Name = data.Name;

        if (data.Surname != null)
            user.Surname = data.Surname;

        if (data.Birthday != null)
            user.Birthday = (DateOnly)data.Birthday;

        dbContext.Users.Update(user);

        return await dbContext.SaveChangesAsync() > 0;
    }

    public List<UserResponse> MapToDTO(List<User> source)
    {
        return source.Select(u => u.GetDTO()).ToList();
    }

    public async Task<List<UserResponseWithRole>> MapToDTOWithRole(List<User> source)
    {
        List<UserResponseWithRole> result = [];

        foreach (var user in source)
        {
            var baseDTO = user.GetDTO();

            var roles = await users.GetRolesAsync(user);

            result.Add(UserResponseWithRole.CreateFromUserResponse(baseDTO, roles[0]));
        }

        return result;
    }

    public async Task<bool> DeleteUserAsync(User user)
    {
        var result = await users.DeleteAsync(user);
        return result.Succeeded;
    }

    public async Task<ServiceActionResult<UserSignInErrorCode>> TrySignInAsync(
        UserSignInRequest requestData
    )
    {
        var result = await signInManager.PasswordSignInAsync(
            requestData.Username,
            requestData.Password,
            requestData.RememberMe,
            lockoutOnFailure: false
        );

        if (!result.Succeeded)
            return new ServiceActionResult<UserSignInErrorCode>
            {
                ErrorCode = UserSignInErrorCode.InvalidCredentials,
            };

        var user = await users.FindByEmailAsync(requestData.Username);

        if (user?.EmailConfirmed == false)
            return new ServiceActionResult<UserSignInErrorCode>
            {
                ErrorCode = UserSignInErrorCode.AccountNotActivated,
            };

        return new ServiceActionResult<UserSignInErrorCode> { IsSuccess = true };
    }

    public async Task<AccountToken?> GetAccountTokenAsync(User user, AccountTokenType tokenType)
    {
        var existingToken = await dbContext
            .AccountTokens.Include(t => t.User)
            .Where(t => t.User.Id == user.Id)
            .Where(t => t.TokenType == tokenType)
            .SingleOrDefaultAsync();

        if (existingToken != null)
        {
            if (DateTime.UtcNow <= existingToken.CreatedAt.AddHours(24))
                return existingToken;

            dbContext.AccountTokens.Remove(existingToken);
        }

        var newToken = new AccountToken()
        {
            Id = Guid.NewGuid(),
            Token = Guid.NewGuid(),
            TokenType = tokenType,
            User = user,
            CreatedAt = DateTime.UtcNow,
        };

        dbContext.AccountTokens.Add(newToken);

        var written = await dbContext.SaveChangesAsync();

        return written > 0 ? newToken : null;
    }

    public async Task<ServiceActionResult<SendActivationEmailErrorCodes>> SendActivationEmailAsync(
        User user,
        string templateID
    )
    {
        var template = mailService.GetTemplate<ConfirmRegistrationTemplateVariables>(templateID);

        if (template == null)
            return new ServiceActionResult<SendActivationEmailErrorCodes> { };

        if (user.EmailConfirmed)
            return new ServiceActionResult<SendActivationEmailErrorCodes>
            {
                ErrorCode = SendActivationEmailErrorCodes.AlreadyActivated,
            };

        var token = await GetAccountTokenAsync(user, AccountTokenType.ActivationToken);

        if (token == null)
            return new ServiceActionResult<SendActivationEmailErrorCodes>
            {
                ErrorCode = SendActivationEmailErrorCodes.DBError,
            };

        var templateData = new ConfirmRegistrationTemplateVariables
        {
            Link = $"http://localhost:5173/activate-account?token={token?.Token}",
        };

        if (
            await mailService.SendEmail("accounts", template.Populate(templateData), [user.Email])
            == false
        )
            return new ServiceActionResult<SendActivationEmailErrorCodes>
            {
                ErrorCode = SendActivationEmailErrorCodes.MailServiceProblem,
            };

        return new ServiceActionResult<SendActivationEmailErrorCodes> { IsSuccess = true };
    }

    public async Task<ServiceActionResult<GenericTokenActionErrors>> ActivateAccountAsync(
        string tokenID
    )
    {
        var token = dbContext
            .AccountTokens.Include(t => t.User)
            .FirstOrDefault(t =>
                t.Token == Guid.Parse(tokenID) && t.TokenType == AccountTokenType.ActivationToken
            );

        if (token == null || DateTime.UtcNow > token.CreatedAt.AddHours(24))
            return new ServiceActionResult<GenericTokenActionErrors>
            {
                ErrorCode = GenericTokenActionErrors.InvalidToken,
            };

        token.User.EmailConfirmed = true;

        dbContext.Users.Update(token.User);
        dbContext.AccountTokens.Remove(token);

        var written = await dbContext.SaveChangesAsync();

        if (written != 2)
            return new ServiceActionResult<GenericTokenActionErrors>
            {
                ErrorCode = GenericTokenActionErrors.DBError,
            };

        return new ServiceActionResult<GenericTokenActionErrors> { IsSuccess = true };
    }

    public async Task<ServiceActionResult<SendRecoveryEmailErrorCodes>> SendRecoveryEmailAsync(
        User user
    )
    {
        var template = mailService.GetTemplate<AccountRecoveryTemplateVariables>(
            "account-recovery"
        );

        if (template == null)
            return new ServiceActionResult<SendRecoveryEmailErrorCodes> { };

        var token = await GetAccountTokenAsync(user, AccountTokenType.PasswordResetToken);

        if (token == null)
            return new ServiceActionResult<SendRecoveryEmailErrorCodes>
            {
                ErrorCode = SendRecoveryEmailErrorCodes.DBError,
            };

        var templateData = new AccountRecoveryTemplateVariables
        {
            Name = user.Name,
            Link = $"http://localhost:5173/reset-password?token={token?.Token}",
        };

        if (
            await mailService.SendEmail("accounts", template.Populate(templateData), [user.Email])
            == false
        )
            return new ServiceActionResult<SendRecoveryEmailErrorCodes>
            {
                ErrorCode = SendRecoveryEmailErrorCodes.MailServiceProblem,
            };

        return new ServiceActionResult<SendRecoveryEmailErrorCodes> { IsSuccess = true };
    }

    public async Task<ServiceActionResult<ChangePasswordTokenActionErrors>> ChangePasswordAsync(
        string tokenID,
        string password
    )
    {
        var token = dbContext
            .AccountTokens.Include(t => t.User)
            .FirstOrDefault(t =>
                t.Token == Guid.Parse(tokenID) && t.TokenType == AccountTokenType.PasswordResetToken
            );

        if (token == null || DateTime.UtcNow > token.CreatedAt.AddHours(24))
            return new ServiceActionResult<ChangePasswordTokenActionErrors>
            {
                ErrorCode = ChangePasswordTokenActionErrors.InvalidToken,
            };

        var errorResult = new ServiceActionResult<ChangePasswordTokenActionErrors>
        {
            ErrorCode = ChangePasswordTokenActionErrors.DBError,
        };

        using (var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
        {
            token.User.LastPasswordChange = DateTime.UtcNow;

            var removalResult = await users.RemovePasswordAsync(token.User);

            if (!removalResult.Succeeded)
                return errorResult;

            var additionResult = await users.AddPasswordAsync(token.User, password);

            if (!additionResult.Succeeded)
                return new ServiceActionResult<ChangePasswordTokenActionErrors>
                {
                    ErrorCode = ChangePasswordTokenActionErrors.PasswordRequirementsNotMet,
                    Details = ExtractIdentityErrors(additionResult.Errors),
                };

            dbContext.AccountTokens.Remove(token);
            dbContext.Users.Update(token.User);

            var written = await dbContext.SaveChangesAsync();

            if (written == 0)
                return errorResult;

            scope.Complete();
        }

        return new ServiceActionResult<ChangePasswordTokenActionErrors> { IsSuccess = true };
    }
}

public interface IUserService
{
    Task<UserCreationResult> CreateAccountAsync(
        UserSignUpRequest requestData,
        UserRole role,
        bool createActivated = false
    );

    Task<ServiceActionResult<SendActivationEmailErrorCodes>> SendActivationEmailAsync(
        User user,
        string templateID
    );

    Task<ServiceActionResult<SendRecoveryEmailErrorCodes>> SendRecoveryEmailAsync(User user);

    Task<AccountToken?> GetAccountTokenAsync(User user, AccountTokenType tokenType);

    Task<ServiceActionResult<GenericTokenActionErrors>> ActivateAccountAsync(string tokenID);

    Task<ServiceActionResult<ChangePasswordTokenActionErrors>> ChangePasswordAsync(
        string tokenID,
        string password
    );

    Task<ServiceActionResult<UserSignInErrorCode>> TrySignInAsync(UserSignInRequest requestData);

    Task<User?> GetUserByIDAsync(string userID);

    Task<User?> GetUserByEmailAsync(string email);

    Task<List<User>> GetAllUsersAsync();

    IQueryable<User> GetUsersAsync(PagingMetadata meta, out int appliedPageSize);

    Task<int> Count();

    Task<bool> HasRole(User user, UserRole roleName);

    Task<bool> UpdateUser(User user, UpdateUserRequest data);

    List<UserResponse> MapToDTO(List<User> source);

    Task<List<UserResponseWithRole>> MapToDTOWithRole(List<User> source);

    Task<bool> DeleteUserAsync(User user);
}
