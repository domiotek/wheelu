using Newtonsoft.Json;

namespace WheeluAPI.DTO.Location;

public class ZipCodeCityMatch
{
	[JsonProperty("kod")]
	public required string ZipCode { get; set; }

	[JsonProperty("miejscowosc")]
	public required string City { get; set; }

	[JsonProperty("wojewodztwo")]
	public required string State { get; set; }
}

