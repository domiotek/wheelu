using WheeluAPI.DTO.Errors;

namespace WheeluAPI.DTO.TPay;

public class TPayRefundTransactionResponse
{
    public required string TransactionId { get; set; }

    public required string Status { get; set; }

    public List<TPayAPIError>? Errors { get; set; }
}
