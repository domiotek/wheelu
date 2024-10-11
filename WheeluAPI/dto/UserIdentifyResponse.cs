namespace WheeluAPI.DTO;

public class OwnedSchoolResponse
{
    public required int Id { get; set; }

    public required string Name { get; set; }
}

public class ActiveInstructorEmploymentResponse
{
    public required int SchoolId { get; set; }

    public required string SchoolName { get; set; }
}

public class InstructorProfileResponse
{
    public required int Id { get; set; }

    public required ActiveInstructorEmploymentResponse? ActiveEmployment { get; set; }
}

public class UserIdentifyResponse
{
    public required string UserId { get; set; }
    public required string Name { get; set; }

    public required string Surname { get; set; }

    public required string Role { get; set; }

    public OwnedSchoolResponse? OwnedSchool { get; set; }

    public InstructorProfileResponse? InstructorProfile { get; set; }
}
