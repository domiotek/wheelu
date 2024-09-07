namespace WheeluAPI.DTO.Errors;

public enum UpdateSchoolErrors
{
    DbError,
    SchoolNotFound,
    AccessDenied,
    InvalidFile,
    AddressResolvingError,
}

public enum ChangeSchoolStateErrors
{
    DbError,
    SchoolNotFound,
    AccessDenied,
}
