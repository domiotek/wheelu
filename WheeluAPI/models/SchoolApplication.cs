namespace WheeluAPI.models;

public class SchoolApplication {
	public int Id { get; set; }

	public required string Name { get; set; }

	public required string NIP { get; set; }

	public required DateOnly Established { get; set; }

	public required DateTime AppliedAt { get; set; }

	public required string Email { get; set; }

	public required string PhoneNumber { get; set; }

	public required string OwnerName { get; set; }

	public required string OwnerSurname { get; set; }

	public required string Street { get; set; }

	public required string BuildingNumber { get; set; }

	public int SubBuildingNumber { get; set; }

	public required string ZipCode { get; set; }

	public required string City { get; set; }

	public required List<string> NearbyCities { get; set; }

}