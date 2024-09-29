namespace WheeluAPI.DTO.Errors;

public class TPayAPIError
{
    public required string ErrorCode { get; set; }

    public required string ErrorMessage { get; set; }
}

public enum TPayAuthorizationErrors
{
    APIError,
    ConfigurationError,
}

public enum TPayTransactionErrors
{
    APIError,

    AccessError,
}
