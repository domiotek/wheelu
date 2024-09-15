using Microsoft.EntityFrameworkCore;
using WheeluAPI.DTO.Errors;
using WheeluAPI.DTO.Instructor;
using WheeluAPI.helpers;
using WheeluAPI.Mail.Templates;
using WheeluAPI.models;
using WheeluAPI.Models;

namespace WheeluAPI.Services;

public class InstructorInviteService(
    ApplicationDbContext dbContext,
    IMailService mailService,
    IUserService userService,
    ILogger<InstructorInviteService> logger
) : BaseService, IInstructorInviteService
{
    public async Task<InstructorInviteToken?> GetInviteTokenAsync(School targetSchool, string email)
    {
        var existingToken = await dbContext
            .InstructorInviteTokens.Where(t => t.Email == email)
            .SingleOrDefaultAsync();

        if (existingToken != null)
        {
            if (DateTime.UtcNow <= existingToken.CreatedAt.AddHours(24))
                return existingToken;

            dbContext.InstructorInviteTokens.Remove(existingToken);
        }

        var newToken = new InstructorInviteToken
        {
            Id = Guid.NewGuid(),
            TargetSchool = targetSchool,
            Email = email,
            CreatedAt = DateTime.UtcNow,
        };

        dbContext.InstructorInviteTokens.Add(newToken);

        var written = await dbContext.SaveChangesAsync();

        return written > 0 ? newToken : null;
    }

    public async Task<InstructorInviteToken?> GetInviteTokenAsync(string token)
    {
        Guid guid;
        try
        {
            guid = Guid.Parse(token);
        }
        catch (Exception)
        {
            return null;
        }

        var existingToken = await dbContext
            .InstructorInviteTokens.Where(t => t.Id == guid)
            .SingleOrDefaultAsync();

        if (existingToken != null)
        {
            if (DateTime.UtcNow <= existingToken.CreatedAt.AddHours(24))
                return existingToken;

            dbContext.InstructorInviteTokens.Remove(existingToken);
        }

        return existingToken;
    }

    public Task<List<InstructorInviteToken>> GetInviteTokensAsync(School? targetSchool = null)
    {
        var query = dbContext.InstructorInviteTokens.AsQueryable();

        if (targetSchool != null)
            query.Where(t => t.TargetSchool == targetSchool);

        return query.ToListAsync();
    }

    public InstructorInviteTokenResponse GetDTO(InstructorInviteToken source)
    {
        return new InstructorInviteTokenResponse
        {
            Id = source.Id.ToString(),
            SchoolId = source.TargetSchool.Id,
            Email = source.Email,
            CreatedAt = source.CreatedAt,
        };
    }

    public List<InstructorInviteTokenResponse> MapToDTO(List<InstructorInviteToken> source)
    {
        return source.Select(GetDTO).ToList();
    }

    private async Task<ServiceActionResult<SchoolInstructorInviteErrors>> SendCreateInviteAsync(
        School targetSchool,
        string email
    )
    {
        var token = await GetInviteTokenAsync(targetSchool, email);

        if (token == null)
            return new ServiceActionResult<SchoolInstructorInviteErrors>
            {
                ErrorCode = SchoolInstructorInviteErrors.DbError,
            };

        var template = mailService.GetTemplate<InstructorInviteCreateTemplateVariables>(
            "instructor-invite-create"
        );

        if (template == null)
            return new ServiceActionResult<SchoolInstructorInviteErrors>
            {
                ErrorCode = SchoolInstructorInviteErrors.DbError,
            };

        var templateData = new InstructorInviteCreateTemplateVariables
        {
            SchoolName = targetSchool.Name,
            Link = $"http://localhost:5173/create-instructor?token={token?.Id}",
        };

        if (
            await mailService.SendEmail("accounts", template.Populate(templateData), [email])
            == false
        )
            return new ServiceActionResult<SchoolInstructorInviteErrors>
            {
                ErrorCode = SchoolInstructorInviteErrors.MailServiceProblem,
            };

        return new ServiceActionResult<SchoolInstructorInviteErrors> { IsSuccess = true };
    }

    private async Task<ServiceActionResult<SchoolInstructorInviteErrors>> SendJoinInviteAsync(
        User instructor,
        School targetSchool
    )
    {
        var token = await GetInviteTokenAsync(targetSchool, instructor.Email!);

        if (token == null)
            return new ServiceActionResult<SchoolInstructorInviteErrors>
            {
                ErrorCode = SchoolInstructorInviteErrors.DbError,
            };

        var template = mailService.GetTemplate<InstructorInviteJoinTemplateVariables>(
            "instructor-invite-join"
        );

        if (template == null)
            return new ServiceActionResult<SchoolInstructorInviteErrors>
            {
                ErrorCode = SchoolInstructorInviteErrors.DbError,
            };

        var templateData = new InstructorInviteJoinTemplateVariables
        {
            FirstName = instructor.Name,
            SchoolName = targetSchool.Name,
            Link = $"http://localhost:5173/join?token={token?.Id}",
        };

        if (
            await mailService.SendEmail(
                "accounts",
                template.Populate(templateData),
                [instructor.Email]
            ) == false
        )
            return new ServiceActionResult<SchoolInstructorInviteErrors>
            {
                ErrorCode = SchoolInstructorInviteErrors.MailServiceProblem,
            };

        return new ServiceActionResult<SchoolInstructorInviteErrors> { IsSuccess = true };
    }

    public async Task<ServiceActionResult<SchoolInstructorInviteErrors>> ResolveInviteAsync(
        School targetSchool,
        string email
    )
    {
        User? user = await userService.GetUserByEmailAsync(email);

        if (user == null)
            return await SendCreateInviteAsync(targetSchool, email);

        if (!await userService.HasRole(user, UserRole.Instructor))
            return new ServiceActionResult<SchoolInstructorInviteErrors>
            {
                ErrorCode = SchoolInstructorInviteErrors.InvalidAccountType,
                Details = ["Must be instructor"],
            };

        var instructor = await dbContext
            .Instructors.Where(i => i.User == user)
            .SingleOrDefaultAsync();

        if (instructor == null)
        {
            instructor = new Instructor { User = user, EmploymentHistory = [] };

            logger.LogWarning(
                "[Broken instructor account] Instructor account type without an instructor profile. This should never happen!. Affected user: {userID}. Creating profile.",
                user.Id
            );
        }

        if (instructor.ActiveEmployment != null)
            return new ServiceActionResult<SchoolInstructorInviteErrors>
            {
                ErrorCode = SchoolInstructorInviteErrors.AlreadyEmployed,
            };

        return await SendJoinInviteAsync(instructor.User, targetSchool);
    }

    public async Task<ServiceActionResult<SchoolInstructorInviteErrors>> ResendInviteAsync(
        InstructorInviteToken token
    )
    {
        User? user = await userService.GetUserByEmailAsync(token.Email);

        if (user == null)
            return await SendCreateInviteAsync(token.TargetSchool, token.Email);

        return await SendJoinInviteAsync(user, token.TargetSchool);
    }

    public async Task<bool> RenewInviteAsync(InstructorInviteToken token)
    {
        token.CreatedAt = DateTime.UtcNow;

        dbContext.InstructorInviteTokens.Update(token);

        return await dbContext.SaveChangesAsync() > 0;
    }

    public async Task<bool> CancelInviteAsync(InstructorInviteToken token)
    {
        dbContext.InstructorInviteTokens.Remove(token);

        return await dbContext.SaveChangesAsync() > 0;
    }
}

public interface IInstructorInviteService
{
    Task<InstructorInviteToken?> GetInviteTokenAsync(School targetSchool, string email);
    Task<InstructorInviteToken?> GetInviteTokenAsync(string token);

    Task<List<InstructorInviteToken>> GetInviteTokensAsync(School? targetSchool = null);

    InstructorInviteTokenResponse GetDTO(InstructorInviteToken source);

    List<InstructorInviteTokenResponse> MapToDTO(List<InstructorInviteToken> source);

    Task<ServiceActionResult<SchoolInstructorInviteErrors>> ResolveInviteAsync(
        School targetSchool,
        string email
    );

    Task<ServiceActionResult<SchoolInstructorInviteErrors>> ResendInviteAsync(
        InstructorInviteToken token
    );

    Task<bool> RenewInviteAsync(InstructorInviteToken token);

    Task<bool> CancelInviteAsync(InstructorInviteToken token);
}
