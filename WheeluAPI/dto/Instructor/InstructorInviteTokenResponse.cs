namespace WheeluAPI.DTO.Instructor;

public class InstructorInviteTokenResponse
{
    public required string Id { get; set; }

    public required int SchoolId { get; set; }

    public required string Email { get; set; }

    public required DateTime CreatedAt { get; set; }
}
