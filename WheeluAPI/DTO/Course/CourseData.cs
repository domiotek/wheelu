using WheeluAPI.Models;

namespace WheeluAPI.DTO.Course;

public class CourseData
{
    public required Models.CourseOffer offer;
    public required models.User student;
    public required SchoolInstructor instructor;
}
