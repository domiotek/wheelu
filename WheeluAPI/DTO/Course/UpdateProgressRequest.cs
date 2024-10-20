using WheeluAPI.Models;

namespace WheeluAPI.DTO.Course;

public class UpdateProgressRequest
{
    public required CourseProgress Progress { get; set; }
}
