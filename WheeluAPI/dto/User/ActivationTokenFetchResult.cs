using WheeluAPI.DTO.Errors;
using WheeluAPI.models;

namespace WheeluAPI.DTO.User;

public class ActivationTokenFetchResult: ServiceActionResult<ActivationTokenFetchErrors> {
	public ActivationToken? Token { get; set; }
}