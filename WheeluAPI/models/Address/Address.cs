namespace WheeluAPI.models;

public class Address {
	public int Id { get; set; }

	public required string Street { get; set; }

	public required string BuildingNumber { get; set; }

	public int SubBuildingNumber { get; set; }
	public required ZipCode ZipCode { get; set; }
}