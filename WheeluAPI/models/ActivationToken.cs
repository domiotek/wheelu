using System.ComponentModel.DataAnnotations;

namespace WheeluAPI.models;

public class ActivationToken {

	[Key]
	public Guid Id { get; set; }
	public required virtual User User { get; set; }
	public required DateTime CreatedAt { get; set; }
	
}