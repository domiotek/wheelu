namespace WheeluAPI.models;

public class SchoolApplication {
	public int Id { get; set; }

	public required string Name { get; set; }

	public required string NIP { get; set; }

	public required DateTime Established { get; set; }

	public required DateTime AppliedAt { get; set; }

	public required string Email { get; set; }

	public required string PhoneNumber { get; set; }

	public required string OwnerName { get; set; }

	public required string OwnerSurname { get; set; }

	public required Address Address { get; set; }

	public required List<City> NearbyCities { get; set; }

}