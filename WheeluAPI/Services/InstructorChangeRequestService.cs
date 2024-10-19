using Microsoft.EntityFrameworkCore;
using WheeluAPI.DTO.Course;
using WheeluAPI.DTO.Course.InstructorChangeRequest;
using WheeluAPI.DTO.Errors;
using WheeluAPI.helpers;
using WheeluAPI.Helpers;
using WheeluAPI.Mail.Templates;
using WheeluAPI.models;
using WheeluAPI.Models;

namespace WheeluAPI.Services;

public class InstructorChangeRequestService(
    ApplicationDbContext dbContext,
    IMailService mailService,
    UrlResolver urlHelper
) : BaseService
{
    public IEnumerable<InstructorChangeRequest> GetRequests(School school)
    {
        return dbContext.InstructorChangeRequests.Where(r => r.Course.School.Id == school.Id);
    }

    public IQueryable<InstructorChangeRequest> PrepareQuery()
    {
        return dbContext.InstructorChangeRequests.AsQueryable();
    }

    public IQueryable<InstructorChangeRequest> GetRequestsPage(
        School school,
        PagingMetadata meta,
        out int appliedPageSize,
        IQueryable<InstructorChangeRequest>? queryable = null
    )
    {
        var results = ApplyPaging(
            queryable
                ?? dbContext
                    .InstructorChangeRequests.AsQueryable()
                    .Where(r => r.Course.School.Id == school.Id),
            meta,
            out int actualPageSize
        );

        appliedPageSize = actualPageSize;

        return results;
    }

    public ValueTask<InstructorChangeRequest?> GetRequestByIDAsync(int id)
    {
        return dbContext.InstructorChangeRequests.FindAsync(id);
    }

    public Task<int> CountAsync(School school)
    {
        var query = PrepareQuery().Where(c => c.Course.School.Id == school.Id);

        return query.CountAsync();
    }

    public async Task<
        ServiceActionWithDataResult<CreateInstructorChangeRequestErrors, InstructorChangeRequest>
    > CreateRequestAsync(InstructorChangeData requestData)
    {
        var result =
            new ServiceActionWithDataResult<
                CreateInstructorChangeRequestErrors,
                InstructorChangeRequest
            >();

        if (requestData.RequestedInstructor != null)
        {
            if (!requestData.Course.School.Instructors.Contains(requestData.RequestedInstructor))
            {
                result.ErrorCode = CreateInstructorChangeRequestErrors.ExternalInstructor;
                result.Details = ["Provided instructor is not part of this school"];
                return result;
            }

            if (
                !requestData
                    .RequestedInstructor.AllowedCategories.Where(cat =>
                        cat.Id == requestData.Course.Category
                    )
                    .Any()
            )
            {
                result.ErrorCode = CreateInstructorChangeRequestErrors.InstructorNotAllowed;
                result.Details = ["Provided instructor can't teach that category"];
                return result;
            }
        }

        var request = new InstructorChangeRequest
        {
            Status = RequestStatus.Pending,
            Course = requestData.Course,
            Requestor = requestData.Requestor,
            RequestorType =
                requestData.Course.Student.Email == requestData.Requestor.Email
                    ? RequestorType.Student
                    : RequestorType.Instructor,
            RequestedInstructor = requestData.RequestedInstructor,
            Note = requestData.Note,
            RequestedAt = DateTime.UtcNow,
            LastStatusChange = DateTime.UtcNow,
        };

        dbContext.InstructorChangeRequests.Add(request);

        if (await dbContext.SaveChangesAsync() == 0)
        {
            result.ErrorCode = CreateInstructorChangeRequestErrors.DbError;
            return result;
        }

        result.IsSuccess = true;
        result.Data = request;
        return result;
    }

    private async Task<bool> SendRequestResolvedEmailAsync(InstructorChangeRequest request)
    {
        var template = mailService.GetTemplate<ICRequestResolvedTemplateVariables>(
            "ic-request-resolved"
        );

        var templateData = new ICRequestResolvedTemplateVariables
        {
            FirstName = request.Requestor.Name,
            OutcomeCaption = request.Status == RequestStatus.Resolved ? "pozytywnie" : "negatywnie",
            Link = $"{urlHelper.GetClientUrl()}/courses/{request.Course.Id}",
        };

        if (
            await mailService.SendEmail(
                "generic",
                template!.Populate(templateData),
                [request.Requestor.Email]
            ) == false
        )
            return false;

        return true;
    }

    public async Task<
        ServiceActionResult<UpdateInstructorChangeRequestErrors>
    > UpdateRequestStatusAsync(InstructorChangeRequest sourceRequest, RequestStatus newStatus)
    {
        var result = new ServiceActionResult<UpdateInstructorChangeRequestErrors>();

        var request = await GetRequestByIDAsync(sourceRequest.Id);

        switch (newStatus)
        {
            case RequestStatus.Pending:
                result.ErrorCode = UpdateInstructorChangeRequestErrors.InvalidState;
                return result;
            default:
                if (request!.Status != RequestStatus.Pending)
                {
                    result.ErrorCode = UpdateInstructorChangeRequestErrors.InvalidState;
                    return result;
                }
                break;
        }

        request.Status = newStatus;
        request.LastStatusChange = DateTime.UtcNow;

        dbContext.InstructorChangeRequests.Update(request);

        if (await dbContext.SaveChangesAsync() == 0)
        {
            result.ErrorCode = UpdateInstructorChangeRequestErrors.DbError;
            return result;
        }

        if (newStatus != RequestStatus.Canceled)
            await SendRequestResolvedEmailAsync(request);
        result.IsSuccess = true;
        return result;
    }
}
