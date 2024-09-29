namespace WheeluAPI.DTO.Errors;

public enum CreateTransactionErrors
{
    DbError,
    TPayError,

    PriceMismatch,
}

public enum RefundTransactionErrors
{
    DbError,
    TPayError,
}
