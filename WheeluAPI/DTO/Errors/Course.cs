namespace WheeluAPI.DTO.Errors;

public enum CourseCreationErrors
{
    DbError,
    InstructorUnavailable,
    SchoolBlocked,
}

public enum CoursePurchaseErrors
{
    DbError = CourseCreationErrors.DbError,
    InstructorUnavailable = CourseCreationErrors.InstructorUnavailable,
    SchoolBlocked = CourseCreationErrors.SchoolBlocked,
    TPayError = CreateTransactionErrors.TPayError + 3,
    PriceMismatch = CreateTransactionErrors.PriceMismatch + 3,
}

public enum CourseHoursPurchaseErrors
{
    DbError,
    TPayError = CreateTransactionErrors.TPayError,
    PriceMismatch = CreateTransactionErrors.PriceMismatch,
}

public enum ChangeInstructorErrors
{
    DbError,
    ExternalInstructor,
    InstructorUnavailable,
    RidesPlanned,
    RideOngoing,
}
