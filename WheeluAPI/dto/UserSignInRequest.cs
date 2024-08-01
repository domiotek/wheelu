namespace WheeluAPI.DTO;

public class UserSignInRequest {
	public required string Username { get; set; }
	
	public required string Password { get; set; }

	public bool RememberMe { get; set; } = false;
}