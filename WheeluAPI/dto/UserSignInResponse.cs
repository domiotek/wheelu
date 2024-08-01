namespace WheeluAPI.DTO;

public enum UserSignInErrorCode {
	InvalidCredentials
}

public class UserSignInResponse {
	public required string Token { get; set; }
}