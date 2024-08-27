namespace WheeluAPI.models;

public class State {
	public int Id { get; set; }
	public required string Name { get; set; }

	public virtual List<City> Cities { get; set; } = [];
}