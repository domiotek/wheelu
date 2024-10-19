using WheeluAPI.DTO.Instructor;
using WheeluAPI.DTO.User;
using WheeluAPI.Models;

namespace WheeluAPI.DTO.Course.InstructorChangeRequest;

public class InstructorChangeResponse
{
    public required int Id { get; set; }

    public required RequestStatus Status { get; set; }

    public required ShortUserResponse Requestor { get; set; }

    public required RequestorType RequestorType { get; set; }

    public required ShortCourseResponse Course { get; set; }

    public ShortSchoolInstructorResponse? RequestedInstructor { get; set; }

    public required string Note { get; set; }

    public required DateTime RequestedAt { get; set; }

    public required DateTime LastStatusChange { get; set; }
}
