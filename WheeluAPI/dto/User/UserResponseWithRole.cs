namespace WheeluAPI.DTO.User;

public class UserResponseWithRole: UserResponse {
	public required string Role { get; set; }

	public static UserResponseWithRole CreateFromUserResponse(UserResponse baseObject, string role) {
		return  new UserResponseWithRole {
			Id = baseObject.Id,
			Email = baseObject.Email,
			Name = baseObject.Name,
			Surname = baseObject.Surname,
			Birthday = baseObject.Birthday,
			CreatedAt = baseObject.CreatedAt,
			IsActivated = baseObject.IsActivated,
			LastPasswordChange = baseObject.LastPasswordChange,
			Role = role
		};
    }
}