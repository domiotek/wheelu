namespace WheeluAPI.models;

public class City {
	public int Id { get; set; }
	public required string Name { get; set; }
	public required virtual State State { get; set; }
	public virtual List<ZipCode> ZipCodes { get; set; } = [];
	public virtual List<School> NearbySchools { get; set; } = [];
}