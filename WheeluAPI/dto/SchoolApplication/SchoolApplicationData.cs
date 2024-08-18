using System.ComponentModel.DataAnnotations;

namespace WheeluAPI.DTO.SchoolApplication;

public class SchoolApplicationData {

	[StringLength(50)]
	public required string SchoolName { get; set; }

	[StringLength(10)]
	public required string NIP { get; set; }
	
	public required string EstablishedDate { get; set; }

	[StringLength(125)]
	public required string Email { get; set; }

	[StringLength(16)]
	public required string PhoneNumber { get; set; }

	[StringLength(maximumLength: 35, MinimumLength = 2)]
	public required string OwnerName { get; set; }

	[StringLength(maximumLength: 50, MinimumLength = 2)]
	public required string OwnerSurname { get; set; }
	public required DateOnly OwnerBirthday { get; set; }

	[StringLength(maximumLength: 75, MinimumLength = 2)]
	public required string Street { get; set; }

	[StringLength(10)]
	public required string BuildingNumber { get; set; }

	public required int SubBuildingNumber { get; set; }

	[StringLength(maximumLength: 6, MinimumLength = 6)]
	public required string ZipCode { get; set; }

	[StringLength(maximumLength: 50, MinimumLength = 2)]
	public required string City { get; set; }

	public required string State { get; set; }

	public required List<string> NearbyCities { get; set; }

}

public class SchoolApplicationResponse: SchoolApplicationData {
	public required int Id { get; set; }
	public required string Status { get; set; }
	public DateTime? ResolvedAt { get; set; }
	public required DateTime AppliedAt { get; set; }
}