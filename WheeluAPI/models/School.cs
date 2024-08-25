namespace WheeluAPI.models;

public class School {
	public int Id { get; set; }

	public required string Name { get; set; }

	public string? Description { get; set; }

	public required string NIP { get; set; }

	public required User Owner { get; set; }

	public required Address Address { get; set; }

	public required DateOnly Established { get; set; }

	public required DateTime Joined { get; set; }

	public required string PhoneNumber { get; set; }

}