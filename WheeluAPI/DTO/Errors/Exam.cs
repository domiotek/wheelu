namespace WheeluAPI.DTO.Errors;

public enum ScheduleExamErrors
{
    DbError,
    InvalidRideStatus,

    AlreadyScheduled,

    ExamAlreadyPassed,
}

public enum ChangeExamCriteriumStateErrors
{
    DbError,
    AccessDenied,
    NoEntity,
    InvalidState,
}
