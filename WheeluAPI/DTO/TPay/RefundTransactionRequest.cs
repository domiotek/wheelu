using Newtonsoft.Json;

namespace WheeluAPI.DTO.TPay;

public class RefundTransactionRequest
{
    public required string TransactionId { get; set; }

    public required decimal Amount { get; set; }
}

public class TPayRefundTransactionRequest
{
    [JsonProperty("amount")]
    public required decimal Amount { get; set; }
}
