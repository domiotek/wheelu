namespace WheeluAPI.DTO.Errors;

public enum SchoolInstructorInviteErrors
{
    DbError,
    MailServiceProblem,
    InvalidAccountType,
    AlreadyEmployed,
}

public enum SchoolInstructorDetachErrors
{
    DbError,
    AlreadyDetached,
    InstructorVisible,
}

public enum SchoolInstructorAttachErrors
{
    DbError,
    AlreadyAttached,
}
