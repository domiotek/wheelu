using WheeluAPI.DTO.Course;
using WheeluAPI.DTO.School;
using WheeluAPI.Models;

namespace WheeluAPI.DTO.Instructor;

public class ShortSchoolInstructorResponse
{
    public int Id { get; set; }

    public required ShortInstructorResponse Instructor { get; set; }

    public required int SchoolId { get; set; }

    public required int AssignedCoursesCount { get; set; }

    public required int ActiveCoursesCount { get; set; }
    public required int MaximumConcurrentStudents { get; set; }

    public required List<CourseCategoryType> AllowedCategories { get; set; } = [];
}

public class SchoolInstructorResponse
{
    public int Id { get; set; }

    public required ShortInstructorResponse Instructor { get; set; }

    public required ShortSchoolResponse School { get; set; }

    public required bool Detached { get; set; }

    public required List<EmploymentRecordResponse> EmploymentRecords { get; set; }

    public required bool Visible { get; set; }

    public required List<ShortCourseResponse> AssignedCourses { get; set; }

    public required int MaximumConcurrentStudents { get; set; }

    public required List<CourseCategoryType> AllowedCategories { get; set; } = [];
}
