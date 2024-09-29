using Newtonsoft.Json;

namespace WheeluAPI.DTO.TPay;

public class RegisterTransactionRequest
{
    public required decimal Amount { get; set; }

    public required string Description { get; set; }

    public required int SchoolID { get; set; }

    public required PayerDetails Payer { get; set; }
}

public class TPayCreateTransactionRequest
{
    [JsonProperty("amount")]
    public required decimal Amount { get; set; }

    [JsonProperty("description")]
    public required string Description { get; set; }

    [JsonProperty("hiddenDescription")]
    public required string HiddenDescription { get; set; }

    [JsonProperty("payer")]
    public required PayerDetails Payer { get; set; }

    [JsonProperty("callbacks")]
    public required CallbacksObject Callbacks { get; set; }
}

public class PayerDetails
{
    [JsonProperty("email")]
    public required string Email { get; set; }

    [JsonProperty("name")]
    public required string Name { get; set; }
}

public class CallbacksObject
{
    [JsonProperty("payerUrls")]
    public required PayerCallbacksObject PayerUrls { get; set; }

    [JsonProperty("notification")]
    public required NotificationCallbacksObject Notification { get; set; }
}

public class PayerCallbacksObject
{
    [JsonProperty("success")]
    public required string Success { get; set; }

    [JsonProperty("error")]
    public required string Error { get; set; }
}

public class NotificationCallbacksObject
{
    [JsonProperty("url")]
    public required string Url { get; set; }
}
