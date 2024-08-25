namespace WheeluAPI.DTO.SchoolApplication;

public class NearbyCityDefinition {
	public int? Id { get; set; }

	public string? Name { get; set; }

	public required string State { get; set; }
}

public class SchoolRegistrationData {
	public required string SchoolName { get; set; }
	public required string Nip { get; set; }
	public required string OwnerName { get; set; }
	public required string OwnerSurname { get; set; }
	public required DateOnly OwnerBirthday { get; set; }
	public required DateOnly EstablishedDate { get; set; }
	public required string Street { get; set; }
	public required string BuildingNumber { get; set; }
	public int? SubBuildingNumber { get; set; }
	public required string ZipCode { get; set; }
	public required string City { get; set; }
	public required string State { get; set; }
	public required List<NearbyCityDefinition> NearbyCities { get; set; }
	public required string Email { get; set; }
	public required string PhoneNumber { get; set; }
}