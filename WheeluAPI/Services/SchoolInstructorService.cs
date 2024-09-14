using Microsoft.EntityFrameworkCore;
using WheeluAPI.DTO.Errors;
using WheeluAPI.DTO.Instructor;
using WheeluAPI.helpers;
using WheeluAPI.Mail.Templates;
using WheeluAPI.models;
using WheeluAPI.Models;

namespace WheeluAPI.Services;

public class SchoolInstructorService(
    ApplicationDbContext dbContext,
    IUserService userService,
    IMailService mailService,
    ICourseOfferService courseOfferService,
    ILogger<SchoolInstructorService> logger
) : BaseService, ISchoolInstructorService
{
    public ValueTask<SchoolInstructor?> GetInstructorByIDAsync(int id)
    {
        return dbContext.SchoolInstructors.FindAsync(id);
    }

    public IQueryable<SchoolInstructor> GetInstructorsAsync()
    {
        return dbContext.SchoolInstructors;
    }

    public IQueryable<SchoolInstructor> GetInstructorsPageAsync(
        PagingMetadata meta,
        out int appliedPageSize
    )
    {
        var results = ApplyPaging(
            dbContext.SchoolInstructors.AsQueryable(),
            meta,
            out int actualPageSize
        );

        appliedPageSize = actualPageSize;

        return results;
    }

    public Task<int> CountAsync()
    {
        return dbContext.SchoolInstructors.CountAsync();
    }

    public SchoolInstructorResponse GetDTO(SchoolInstructor source)
    {
        return new SchoolInstructorResponse
        {
            Id = source.Id,
            Instructor = new ShortInstructorResponse
            {
                Id = source.Instructor.Id,
                User = source.Instructor.User.GetShortDTO(),
            },
            SchoolId = source.School.Id,
            Detached = source.Detached,
            Visible = source.Detached,
            EmploymentRecords = source.EmploymentRecords,
            MaximumConcurrentStudends = source.MaximumConcurrentStudends,
            AllowedCategories = source.AllowedCategories.Select(c => c.Id).ToList(),
        };
    }

    public List<SchoolInstructorResponse> MapToDTO(List<SchoolInstructor> source)
    {
        return source.Select(GetDTO).ToList();
    }

    public async Task<InstructorInviteToken?> GetInstructorInviteTokenAsync(
        School targetSchool,
        string email
    )
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

    public async Task<InstructorInviteToken?> GetInstructorInviteTokenAsync(string token)
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

    private async Task<
        ServiceActionResult<SchoolInstructorInviteErrors>
    > InviteCreateInstructorAsync(School targetSchool, string email)
    {
        var token = await GetInstructorInviteTokenAsync(targetSchool, email);

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

    private async Task<ServiceActionResult<SchoolInstructorInviteErrors>> InviteJoinInstructorAsync(
        Instructor instructor,
        School targetSchool
    )
    {
        var token = await GetInstructorInviteTokenAsync(targetSchool, instructor.User.Email!);

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
            FirstName = instructor.User.Name,
            SchoolName = targetSchool.Name,
            Link = $"http://localhost:5173/join?token={token?.Id}",
        };

        if (
            await mailService.SendEmail(
                "accounts",
                template.Populate(templateData),
                [instructor.User.Email]
            ) == false
        )
            return new ServiceActionResult<SchoolInstructorInviteErrors>
            {
                ErrorCode = SchoolInstructorInviteErrors.MailServiceProblem,
            };

        return new ServiceActionResult<SchoolInstructorInviteErrors> { IsSuccess = true };
    }

    public async Task<
        ServiceActionResult<SchoolInstructorInviteErrors>
    > ResolveInstructorInviteAsync(School targetSchool, string email)
    {
        User? user = await userService.GetUserByEmailAsync(email);

        if (user == null)
            return await InviteCreateInstructorAsync(targetSchool, email);

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

        return await InviteJoinInstructorAsync(instructor, targetSchool);
    }

    public async Task<bool> UpdateInstructorVisibilityAsync(SchoolInstructor instructor, bool state)
    {
        instructor.Visible = state;

        dbContext.SchoolInstructors.Update(instructor);
        return await dbContext.SaveChangesAsync() > 0;
    }

    public async Task<bool> UpdateInstructorPropertiesAsync(
        SchoolInstructor instructor,
        SchoolInstructorProperties properties
    )
    {
        instructor.MaximumConcurrentStudends = properties.MaximumConcurrentStudends;

        dbContext.SchoolInstructors.Update(instructor);

        return await dbContext.SaveChangesAsync() > 0;
    }

    public async Task<bool> UpdateInstructorAllowedCategoriesAsync(
        SchoolInstructor instructor,
        List<CourseCategoryType> allowedCategories
    )
    {
        var result = new List<CourseCategory>();

        foreach (var categoryID in allowedCategories)
        {
            var category = await courseOfferService.GetCourseCategoryAsync(categoryID);
            if (category != null)
                result.Add(category);
        }

        instructor.AllowedCategories = result;

        dbContext.SchoolInstructors.Update(instructor);

        return await dbContext.SaveChangesAsync() > 0;
    }

    public async Task<ServiceActionResult<SchoolInstructorAttachErrors>> AttachInstructorAsync(
        School school,
        Instructor instructor
    )
    {
        var result = new ServiceActionResult<SchoolInstructorAttachErrors>();

        if (instructor.ActiveEmployment != null)
        {
            result.ErrorCode = SchoolInstructorAttachErrors.AlreadyAttached;
            return result;
        }

        var employeeProfile = await dbContext
            .SchoolInstructors.Where(i => i.School == school)
            .Where(i => i.Instructor == instructor)
            .SingleOrDefaultAsync();

        if (employeeProfile == null)
        {
            employeeProfile = new SchoolInstructor
            {
                School = school,
                Instructor = instructor,
                Detached = false,
                EmploymentRecords = [],
                Visible = false,
                MaximumConcurrentStudends = 0,
                AllowedCategories = [],
            };

            dbContext.SchoolInstructors.Add(employeeProfile);
        }

        employeeProfile.Detached = false;
        employeeProfile.EmploymentRecords.Add(
            new EmploymentRecord { StartTime = DateTime.UtcNow, Instructor = employeeProfile }
        );

        dbContext.SchoolInstructors.Update(employeeProfile);

        if (await dbContext.SaveChangesAsync() == 0)
        {
            result.ErrorCode = SchoolInstructorAttachErrors.DbError;
            return result;
        }

        result.IsSuccess = true;
        return result;
    }

    public async Task<ServiceActionResult<SchoolInstructorDetachErrors>> DetachInstructorAsync(
        SchoolInstructor instructor
    )
    {
        var result = new ServiceActionResult<SchoolInstructorDetachErrors>();

        if (instructor.Detached)
        {
            result.ErrorCode = SchoolInstructorDetachErrors.AlreadyDetached;
            return result;
        }

        if (instructor.Visible)
        {
            result.ErrorCode = SchoolInstructorDetachErrors.InstructorVisible;
            return result;
        }

        instructor.Detached = true;
        var record = instructor.EmploymentRecords.LastOrDefault();

        if (record == null)
        {
            logger.LogWarning(
                "[BrokenInstructorAccount] Employed instructor without employment record. This should never happen!. Affected SchoolInstructor: {instructorID}. Will fix, but won't be pretty.",
                instructor.Id
            );
            record = new EmploymentRecord { Instructor = instructor, StartTime = DateTime.UtcNow };

            instructor.EmploymentRecords.Add(record);
        }

        record.EndTime = DateTime.UtcNow;
        instructor.AllowedCategories.Clear();

        dbContext.SchoolInstructors.Update(instructor);

        var template = mailService.GetTemplate<InstructorDetachTemplateVariables>(
            "instructor-detach"
        );

        if (template == null)
        {
            result.ErrorCode = SchoolInstructorDetachErrors.DbError;
            result.Details.Add("Template not found.");
            return result;
        }

        var templateData = new InstructorDetachTemplateVariables
        {
            FirstName = instructor.Instructor.User.Name,
            SchoolName = instructor.School.Name,
        };

        await mailService.SendEmail(
            "accounts",
            template.Populate(templateData),
            [instructor.Instructor.User.Email]
        );

        if (await dbContext.SaveChangesAsync() == 0)
        {
            result.ErrorCode = SchoolInstructorDetachErrors.DbError;
            return result;
        }

        result.IsSuccess = true;
        return result;
    }
}

public interface ISchoolInstructorService
{
    ValueTask<SchoolInstructor?> GetInstructorByIDAsync(int id);

    IQueryable<SchoolInstructor> GetInstructorsAsync();

    IQueryable<SchoolInstructor> GetInstructorsPageAsync(
        PagingMetadata meta,
        out int appliedPageSize
    );

    Task<int> CountAsync();

    SchoolInstructorResponse GetDTO(SchoolInstructor source);

    List<SchoolInstructorResponse> MapToDTO(List<SchoolInstructor> source);

    Task<InstructorInviteToken?> GetInstructorInviteTokenAsync(School targetSchool, string email);
    Task<InstructorInviteToken?> GetInstructorInviteTokenAsync(string token);

    Task<ServiceActionResult<SchoolInstructorInviteErrors>> ResolveInstructorInviteAsync(
        School targetSchool,
        string email
    );

    Task<bool> UpdateInstructorVisibilityAsync(SchoolInstructor instructor, bool state);

    Task<bool> UpdateInstructorPropertiesAsync(
        SchoolInstructor instructor,
        SchoolInstructorProperties properties
    );

    Task<bool> UpdateInstructorAllowedCategoriesAsync(
        SchoolInstructor instructor,
        List<CourseCategoryType> allowedCategories
    );

    Task<ServiceActionResult<SchoolInstructorAttachErrors>> AttachInstructorAsync(
        School school,
        Instructor instructor
    );

    Task<ServiceActionResult<SchoolInstructorDetachErrors>> DetachInstructorAsync(
        SchoolInstructor instructor
    );
}
