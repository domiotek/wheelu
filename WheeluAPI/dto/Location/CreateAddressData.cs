using WheeluAPI.models;

namespace WheeluAPI.DTO.Location;

public class CreateAddressData {
	public required string Street { get; set; }
	public required string BuildingNumber { get; set; }
	public int? SubBuildingNumber { get; set; }
	public required ZipCode ZipCode { get; set; }
}