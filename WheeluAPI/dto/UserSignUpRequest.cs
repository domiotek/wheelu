namespace WheeluAPI.DTO;

public class UserSignUpRequest {
	public required string Username { get; set; }
	
	public required string Password { get; set; }

	public required string Name { get; set; }

	public required string Surname { get; set; }

	
}