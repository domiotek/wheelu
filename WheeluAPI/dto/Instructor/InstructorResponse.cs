using WheeluAPI.DTO.User;

namespace WheeluAPI.DTO.Instructor;

public class ShortInstructorResponse
{
    public int Id { get; set; }

    public required ShortUserResponse User { get; set; }
}

public class InstructorResponse
{
    public int Id { get; set; }

    public required ShortUserResponse User { get; set; }

    public virtual required List<SchoolInstructorResponse> EmploymentHistory { get; set; } = [];

    public required decimal Grade { get; set; }

    public required int ReviewCount { get; set; }
}
