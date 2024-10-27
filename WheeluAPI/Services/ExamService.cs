using System.Reflection;
using WheeluAPI.DTO.Course.ExamHub;
using WheeluAPI.DTO.Errors;
using WheeluAPI.helpers;
using WheeluAPI.models;
using WheeluAPI.Models;

namespace WheeluAPI.Services;

public class ExamService(ApplicationDbContext dbContext, ScheduleService scheduleService)
    : BaseService
{
    public ValueTask<Exam?> GetExamByIDAsync(int id)
    {
        return dbContext.Exams.FindAsync(id);
    }

    public async Task<ServiceActionWithDataResult<ScheduleExamErrors, Exam>> ScheduleExamAsync(
        Course course,
        Ride ride
    )
    {
        var result = new ServiceActionWithDataResult<ScheduleExamErrors, Exam>();

        if (ride.Status != RideStatus.Planned)
        {
            result.ErrorCode = ScheduleExamErrors.InvalidRideStatus;
            result.Details = ["Ride must be in 'planned' state"];
            return result;
        }

        if (course.NextExam != null)
        {
            result.ErrorCode = ScheduleExamErrors.AlreadyScheduled;
            result.Details = ["You can schedule only one exam at a time."];
        }

        if (course.PassedInternalExam)
        {
            result.ErrorCode = ScheduleExamErrors.ExamAlreadyPassed;
            return result;
        }

        var exam = new Exam
        {
            Course = course,
            RideId = ride.Id,
            State = ExamState.Planned,
        };

        dbContext.Exams.Add(exam);

        if (await dbContext.SaveChangesAsync() == 0)
        {
            result.ErrorCode = ScheduleExamErrors.DbError;
            return result;
        }

        result.IsSuccess = true;
        result.Data = exam;
        return result;
    }

    public async Task<bool> StartExamAsync(Exam exam)
    {
        if (exam.State != ExamState.Planned)
            return false;

        await scheduleService.StartRide((Ride)exam.Ride);
        exam.State = ExamState.Ongoing;

        if (await dbContext.SaveChangesAsync() == 0)
            return false;

        return true;
    }

    public async Task<bool> CancelExamAsync(Exam exam, User requestor)
    {
        if (exam.State != ExamState.Planned)
            return false;

        await scheduleService.CancelRide((Ride)exam.Ride, requestor);
        exam.State = ExamState.Canceled;

        if (await dbContext.SaveChangesAsync() == 0)
            return false;

        return true;
    }

    public async Task<
        ServiceActionResult<ChangeExamCriteriumStateErrors>
    > UpdateExamCriteriumStateAsync(
        Exam exam,
        CriteriaScope scope,
        string criterium,
        ExamCriteriumState state
    )
    {
        var response = new ServiceActionResult<ChangeExamCriteriumStateErrors>();

        if (exam.State != ExamState.Ongoing)
        {
            response.ErrorCode = ChangeExamCriteriumStateErrors.InvalidState;
            return response;
        }

        var examState = exam.ExamResult;

        object targetSet;

        if (scope == CriteriaScope.ManeuverCriteria)
            targetSet = examState.ManeuverCriteria;
        else
            targetSet = examState.DrivingCriteria;

        PropertyInfo? property = targetSet.GetType().GetProperty(criterium);
        if (property == null || !typeof(IExamCriterium).IsAssignableFrom(property.PropertyType))
        {
            response.ErrorCode = ChangeExamCriteriumStateErrors.NoEntity;
            response.Details = ["No such criterium"];
            return response;
        }

        IExamCriterium prevValue = (IExamCriterium)property.GetValue(targetSet)!;

        property.SetValue(
            targetSet,
            new ExamCriterium { State = state, HiddenIn = prevValue.HiddenIn }
        );

        exam.ExamResult = examState;

        dbContext.Exams.Update(exam);

        if (await dbContext.SaveChangesAsync() == 0)
        {
            response.ErrorCode = ChangeExamCriteriumStateErrors.DbError;
            return response;
        }

        response.IsSuccess = true;
        return response;
    }

    public async Task<bool> EndExamAsync(Exam exam)
    {
        if (exam.State != ExamState.Ongoing)
            return false;

        await scheduleService.EndRide((Ride)exam.Ride);
        var result = exam.ExamResult;
        var hasPassed = result.PassedItems == result.TotalItems;
        exam.State = hasPassed ? ExamState.Passed : ExamState.Failed;

        if (await dbContext.SaveChangesAsync() == 0)
            return false;

        return true;
    }
}
