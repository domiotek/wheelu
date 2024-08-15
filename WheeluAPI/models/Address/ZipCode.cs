namespace WheeluAPI.models;

public class ZipCode {
	public int Id { get; set; }

	public required string Name { get; set; }

	public required virtual City City { get; set; }
}