namespace WheeluAPI.DTO;

public class UserIdentifyResponse
{
    public required string UserId { get; set; }
    public required string Name { get; set; }

    public required string Surname { get; set; }

    public required string Role { get; set; }

    public int? OwnedSchoolId { get; set; }

    public int? InstructorProfileId { get; set; }
}
