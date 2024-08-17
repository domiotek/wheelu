namespace WheeluAPI.DTO;

public enum UserSignInErrorCode {
	InvalidCredentials,
	AccountNotActivated
}

public class UserSignInResponse {
	public required string Token { get; set; }
}