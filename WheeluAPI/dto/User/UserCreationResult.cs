namespace WheeluAPI.DTO.User;

public class UserCreationResult: ServiceActionResult<UserSignUpErrorCode> {
	public models.User? User { get; set; }
}