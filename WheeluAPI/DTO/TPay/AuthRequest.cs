using Newtonsoft.Json;

namespace WheeluAPI.DTO.TPay;

public class AuthRequest
{
    [JsonProperty("client_id")]
    public required string ClientId { get; set; }

    [JsonProperty("client_secret")]
    public required string ClientSecret { get; set; }
}
