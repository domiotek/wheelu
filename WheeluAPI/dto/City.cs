namespace WheeluAPI.DTO;

public class City {
	public required int Id { get; set; }

	public required string Name { get; set; }

	public required State State { get; set; }
}