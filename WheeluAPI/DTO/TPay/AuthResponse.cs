using Newtonsoft.Json;

namespace WheeluAPI.DTO.TPay;

public class AuthResponse
{
    [JsonProperty("access_token")]
    public required string AccessToken { get; set; }
}
