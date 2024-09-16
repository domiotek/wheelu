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
            Visible = source.Visible,
            EmploymentRecords = source
                .EmploymentRecords.Select(rec => new EmploymentRecordResponse
                {
                    Id = rec.Id,
                    StartTime = rec.StartTime,
                    EndTime = rec.EndTime,
                })
                .ToList(),
            MaximumConcurrentStudents = source.MaximumConcurrentStudents,
            AllowedCategories = source.AllowedCategories.Select(c => c.Id).ToList(),
        };
    }

    public List<SchoolInstructorResponse> MapToDTO(List<SchoolInstructor> source)
    {
        return source.Select(GetDTO).ToList();
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
        instructor.MaximumConcurrentStudents = properties.MaximumConcurrentStudents;

        dbContext.SchoolInstructors.Update(instructor);

        return await dbContext.SaveChangesAsync() > 0;
    }

    public async Task<bool> UpdateInstructorAllowedCategoriesAsync(
        SchoolInstructor instructor,
        List<CourseCategoryType> allowedCategories
    )
    {
        for (var i = 0; i < instructor.AllowedCategories.Count; i++)
        {
            var category = instructor.AllowedCategories[i];

            if (allowedCategories.Contains(category.Id))
                allowedCategories.Remove(category.Id);
            else
            {
                instructor.AllowedCategories.Remove(category);
                i--;
            }
        }

        foreach (var categoryID in allowedCategories)
        {
            var category = await courseOfferService.GetCourseCategoryAsync(categoryID);
            if (category != null)
                instructor.AllowedCategories.Add(category);
        }

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

        var created = false;

        if (employeeProfile == null)
        {
            created = true;
            employeeProfile = new SchoolInstructor
            {
                School = school,
                Instructor = instructor,
                Detached = false,
                EmploymentRecords = [],
                Visible = false,
                MaximumConcurrentStudents = 0,
                AllowedCategories = [],
            };

            dbContext.SchoolInstructors.Add(employeeProfile);
        }

        employeeProfile.Detached = false;
        employeeProfile.EmploymentRecords.Add(
            new EmploymentRecord { StartTime = DateTime.UtcNow, Instructor = employeeProfile }
        );

        if (!created)
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
