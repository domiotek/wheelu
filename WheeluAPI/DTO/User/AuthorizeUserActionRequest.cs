namespace WheeluAPI.DTO.User;

public enum AuthorizableAccountActions
{
    ChangePassword,
}

public class AuthorizeUserActionRequest
{
    public required AuthorizableAccountActions Action { get; set; }
}
