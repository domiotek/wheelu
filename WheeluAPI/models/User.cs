using Microsoft.AspNetCore.Identity;

namespace WheeluAPI.models;


public class User: IdentityUser {
	public required string Name { get; set; }

	public required string Surname { get; set; }

	public required DateTime CreatedAt { get; set; }
}