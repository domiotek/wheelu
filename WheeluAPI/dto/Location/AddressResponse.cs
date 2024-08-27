namespace WheeluAPI.DTO.Location;

public class AddressResponse {
	public required string Street { get; set; }

	public required string BuildingNumber { get; set; }

	public int? SubBuildingNumber { get; set; }
	
	public required string ZipCode { get; set; }

	public required string City { get; set; }

	public required string State { get; set; }
}