using WheeluAPI.DTO.Errors;
using WheeluAPI.models;

namespace WheeluAPI.DTO.Location;

public class ComposeAddressResult: ServiceActionResult<ComposeAddressErrCodes> {
	public Address? Address{ get; set; }
}