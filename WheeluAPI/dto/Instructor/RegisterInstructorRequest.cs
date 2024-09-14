namespace WheeluAPI.DTO.Instructor;

public class RegisterInstructorRequest : UserSignUpRequest
{
    public required string Token { get; set; }
}
