using System.Collections.Concurrent;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using WheeluAPI.DTO.Course;
using WheeluAPI.DTO.Course.ExamHub;
using WheeluAPI.DTO.Errors;
using WheeluAPI.helpers;
using WheeluAPI.Mappers;
using WheeluAPI.Models;
using WheeluAPI.Services;

namespace WheeluAPI.Hubs;

[Authorize]
public class ExamHub(ExamService examService, ExamMapper mapper) : Hub
{
    private static readonly ConcurrentDictionary<string, string> GroupUsers = new();

    public override async Task OnConnectedAsync()
    {
        var userRole = Context.User?.FindFirst(ClaimTypes.Role)?.Value;

        if (Context.UserIdentifier == null || userRole != "Instructor")
        {
            Context.Abort();
            return;
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        foreach (var group in GroupUsers)
        {
            if (group.Value == Context.ConnectionId)
            {
                GroupUsers.TryRemove(group.Key, out _);
            }
        }

        await base.OnDisconnectedAsync(exception);
    }

    public async Task<
        ServiceActionWithDataResultEx<ExamSessionRegistrationErrors, ExamResponse>
    > RegisterForExamTracking(int examID)
    {
        var response =
            new ServiceActionWithDataResultEx<ExamSessionRegistrationErrors, ExamResponse>();

        var exam = await examService.GetExamByIDAsync(examID);

        if (exam == null)
        {
            response.ErrorCode = ExamSessionRegistrationErrors.NoEntity;
            return response;
        }

        if (exam.State != ExamState.Ongoing)
        {
            response.ErrorCode = ExamSessionRegistrationErrors.InvalidState;
            return response;
        }

        if (exam.Ride.Instructor.Instructor.User.Email != Context.UserIdentifier)
        {
            response.ErrorCode = ExamSessionRegistrationErrors.AccessDenied;
            return response;
        }

        GroupUsers.TryGetValue("EXAM-" + exam.Id, out string? connectionId);

        if (connectionId != null)
        {
            await Clients.Client(connectionId).SendAsync("kick");
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, "EXAM-" + examID);
        GroupUsers["EXAM-" + examID] = Context.ConnectionId;

        response.IsSuccess = true;
        response.Data = mapper.GetDTO(exam);
        return response;
    }

    private bool ValidateExamAccess(int examID)
    {
        return GroupUsers["EXAM-" + examID] == Context.ConnectionId;
    }

    public async Task<ServiceActionResultEx<ChangeExamCriteriumStateErrors>> ChangeCriteriumState(
        int examID,
        CriteriaScope scope,
        string criterium,
        ExamCriteriumState state
    )
    {
        var response = new ServiceActionResultEx<ChangeExamCriteriumStateErrors>();

        if (!ValidateExamAccess(examID))
        {
            response.ErrorCode = ChangeExamCriteriumStateErrors.AccessDenied;
            return response;
        }

        var exam = await examService.GetExamByIDAsync(examID);

        if (exam == null)
        {
            response.ErrorCode = ChangeExamCriteriumStateErrors.NoEntity;
            response.Details = ["No such exam"];
            return response;
        }

        criterium = char.ToUpper(criterium[0]) + criterium[1..];

        var updateResult = await examService.UpdateExamCriteriumStateAsync(
            exam,
            scope,
            criterium,
            state
        );

        response.IsSuccess = updateResult.IsSuccess;
        response.ErrorCode = updateResult.ErrorCode;
        response.Details = updateResult.Details;

        return response;
    }

    public async Task<ServiceActionResultEx<APIErrorCode>> EndExam(int examID)
    {
        var response = new ServiceActionResultEx<APIErrorCode>();

        if (!ValidateExamAccess(examID))
        {
            response.ErrorCode = APIErrorCode.AccessDenied;
            return response;
        }

        var exam = await examService.GetExamByIDAsync(examID);

        if (exam == null)
        {
            response.ErrorCode = APIErrorCode.EntityNotFound;
            response.Details = ["No such exam"];
            return response;
        }

        var result = await examService.EndExamAsync(exam);

        if (!result)
        {
            response.ErrorCode = APIErrorCode.DbError;
            return response;
        }

        response.IsSuccess = true;
        return response;
    }
}
