namespace WheeluAPI.DTO.User;

public class UserResponse {
	public required string Id { get; set; }
	public required string Email { get; set; }
	public required string Name { get; set; }
	public required string Surname { get; set; }
	public required DateOnly Birthday { get; set; }
	public required DateTime CreatedAt { get; set; }
	public required bool IsActivated { get; set; }
	public required DateTime LastPasswordChange { get; set; }
}