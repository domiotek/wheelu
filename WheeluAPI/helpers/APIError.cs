using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace WheeluAPI.helpers;

public enum APIErrorCode {
	UnexpectedError,
	Unauthorized
}


public class APIError<T> {

	[JsonConverter(typeof(StringEnumConverter))]
	public required T Code { get; set; }

	public List<string> Details { get; set; } = [];
}

public class APIError {

	[JsonConverter(typeof(StringEnumConverter))]
	public required APIErrorCode Code { get; set; }

	public List<string> Details { get; set; } = [];
}