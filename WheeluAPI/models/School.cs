using WheeluAPI.DTO.School;

namespace WheeluAPI.models;

public class School {
	public int Id { get; set; }

	public required bool Hidden { get; set; }

	public required string Name { get; set; }

	public string? Description { get; set; }

	public required string NIP { get; set; }

	public required virtual User Owner { get; set; }

	public required virtual Address Address { get; set; }

	public required DateOnly Established { get; set; }

	public required DateTime Joined { get; set; }

	public required string PhoneNumber { get; set; }

	public SchoolResponse GetDTO() {
		return new SchoolResponse {
			Id = Id,
			Hidden = Hidden,
			Name = Name,
			Description = Description,
			NIP = NIP,
			Owner = Owner.GetShortDTO(),
			Address = Address.GetDTO(),
			Established = Established,
			Joined = Joined,
			PhoneNumber = PhoneNumber
		};
	}
}