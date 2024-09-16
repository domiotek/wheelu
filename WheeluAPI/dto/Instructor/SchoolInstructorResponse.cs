using WheeluAPI.Models;

namespace WheeluAPI.DTO.Instructor;

public class SchoolInstructorResponse
{
    public int Id { get; set; }

    public required ShortInstructorResponse Instructor { get; set; }

    public required int SchoolId { get; set; }

    public required bool Detached { get; set; }

    public required List<EmploymentRecordResponse> EmploymentRecords { get; set; }

    public required bool Visible { get; set; }

    public required int MaximumConcurrentStudents { get; set; }

    public required List<CourseCategoryType> AllowedCategories { get; set; } = [];
}
