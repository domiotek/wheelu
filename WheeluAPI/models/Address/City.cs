namespace WheeluAPI.models;

public class City {
	public int Id { get; set; }
	public required string Name { get; set; }

	public List<ZipCode> ZipCodes { get; set; } = [];
}