using WheeluAPI.DTO.Schedule;
using WheeluAPI.DTO.School;
using WheeluAPI.DTO.User;
using WheeluAPI.Models;

namespace WheeluAPI.DTO.Course;

public class ShortCourseResponse
{
    public required int Id { get; set; }
    public required CourseCategoryType Category { get; set; }
    public required int SchoolId { get; set; }

    public required ShortUserResponse Student { get; set; }
    public required ShortUserResponse Instructor { get; set; }
}

public class LimitedCourseResponse
{
    public required int Id { get; set; }

    public required CourseCategoryType Category { get; set; }

    public required int SchoolId { get; set; }

    public required ShortUserResponse Student { get; set; }

    public required ShortUserResponse Instructor { get; set; }

    public required int HoursCount { get; set; }

    public required decimal PricePerHour { get; set; }

    public required DateTime CreatedAt { get; set; }

    public required bool Archived { get; set; }
}

public class CourseResponse
{
    public required int Id { get; set; }

    public required CourseCategoryType Category { get; set; }

    public required ShortSchoolResponse School { get; set; }

    public required ShortUserResponse Student { get; set; }

    public required int InstructorId { get; set; }

    public required int SchoolInstructorId { get; set; }

    public required ShortUserResponse Instructor { get; set; }

    public required double UsedHours { get; set; }

    public required int HoursCount { get; set; }

    public ShortRideResponse? NextRide { get; set; }

    public ShortRideResponse? OngoingRide { get; set; }

    public required CourseProgress CourseProgress { get; set; }

    public required decimal PricePerHour { get; set; }

    public required DateTime CreatedAt { get; set; }

    public required bool Archived { get; set; }
}
