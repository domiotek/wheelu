using WheeluAPI.DTO.Location;
using WheeluAPI.DTO.User;

namespace WheeluAPI.DTO.School;

public class SchoolResponse {
	public int Id { get; set; }

	public required string Name { get; set; }

	public string? Description { get; set; }

	public required string NIP { get; set; }

	public required bool Hidden { get; set; }

	public required ShortUserResponse Owner { get; set; }

	public required AddressResponse Address { get; set; }

	public required DateOnly Established { get; set; }

	public required DateTime Joined { get; set; }

	public required string PhoneNumber { get; set; }
}