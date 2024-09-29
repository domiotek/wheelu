namespace WheeluAPI.DTO.Course;

public class CreateCourseRequest
{
    public required decimal TotalAmount { get; set; }
    public required int InstructorId { get; set; }
}
