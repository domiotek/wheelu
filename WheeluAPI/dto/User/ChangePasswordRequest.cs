namespace WheeluAPI.DTO.User;

public class ChangePasswordRequest {
	public required string Token { get; set; }
	public required string Password { get; set; }
}