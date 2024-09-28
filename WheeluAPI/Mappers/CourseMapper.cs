using WheeluAPI.DTO.Course;
using WheeluAPI.Models;

namespace WheeluAPI.Mappers;

public class CourseMapper
{
    public ShortCourseResponse GetShortDTO(Course source)
    {
        return new ShortCourseResponse
        {
            Id = source.Id,
            Category = source.Category,
            SchoolId = source.School.Id,
            Student = source.Student.GetShortDTO(),
            Instructor = source.Instructor.Instructor.User.GetShortDTO(),
            HoursCount = source.HoursCount,
            PricePerHour = source.PricePerHour,
            PurchasedAt = source.PurchasedAt,
            Archived = source.Archived,
        };
    }

    public List<ShortCourseResponse> MapToShortDTO(List<Course> courses)
    {
        return courses.Select(GetShortDTO).ToList();
    }
}
