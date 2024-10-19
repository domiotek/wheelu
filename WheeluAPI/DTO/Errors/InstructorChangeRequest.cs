namespace WheeluAPI.DTO.Errors;

public enum CreateInstructorChangeRequestErrors
{
    DbError,
    ExternalInstructor,
    InstructorNotAllowed,
}

public enum UpdateInstructorChangeRequestErrors
{
    DbError,
    InvalidState,
}
