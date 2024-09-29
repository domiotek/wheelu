using Newtonsoft.Json;
using WheeluAPI.DTO.Errors;

namespace WheeluAPI.DTO.TPay;

public class TPayCreateTransactionResponse
{
    public required string TransactionId { get; set; }

    public required string Title { get; set; }

    public string? TransactionPaymentUrl { get; set; }

    public required string Status { get; set; }

    public List<TPayAPIError>? Errors { get; set; }
}

public class RegisterTransactionResponse
{
    public required string TransactionId { get; set; }

    public required string Title { get; set; }

    public required string TransactionPaymentUrl { get; set; }
}
