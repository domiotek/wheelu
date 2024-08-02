namespace WheeluAPI.models;

public class Address {
	public required int Id { get; set; }

	public required string Street { get; set; }

	public required string BuildingNumber { get; set; }

	public int Apartment { get; set; }
	public required ZipCode ZipCode { get; set; }
}