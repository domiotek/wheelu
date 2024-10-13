using WheeluAPI.DTO.Course;
using WheeluAPI.Models;

namespace WheeluAPI.Mappers;

public class CourseMapper(SchoolMapper schoolMapper)
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
            HoursCount = source.BaseHoursCount,
            PricePerHour = source.PricePerHour,
            CreatedAt = source.CreatedAt,
            Archived = source.Archived,
        };
    }

    public CourseResponse GetDTO(Course source)
    {
        return new CourseResponse
        {
            Id = source.Id,
            Category = source.Category,
            School = schoolMapper.GetShortDTO(source.School),
            Student = source.Student.GetShortDTO(),
            Instructor = source.Instructor.Instructor.User.GetShortDTO(),
            HoursCount = source.BaseHoursCount,
            PricePerHour = source.PricePerHour,
            CreatedAt = source.CreatedAt,
            Archived = source.Archived,
        };
    }

    public List<ShortCourseResponse> MapToShortDTO(List<Course> courses)
    {
        return courses.Select(GetShortDTO).ToList();
    }

    public List<CourseResponse> MapToDTO(List<Course> courses)
    {
        return courses.Select(GetDTO).ToList();
    }
}
