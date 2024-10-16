using WheeluAPI.DTO.Course;
using WheeluAPI.Models;

namespace WheeluAPI.Mappers;

public class CourseMapper(SchoolMapper schoolMapper, IServiceProvider serviceProvider)
{
    private ScheduleMapper? _scheduleMapper;

    public ShortCourseResponse GetShortDTO(Course source)
    {
        return new ShortCourseResponse
        {
            Id = source.Id,
            Category = source.Category,
            SchoolId = source.School.Id,
            Student = source.Student.GetShortDTO(),
            Instructor = source.Instructor.Instructor.User.GetShortDTO(),
        };
    }

    public LimitedCourseResponse GetLimitedDTO(Course source)
    {
        return new LimitedCourseResponse
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
        _scheduleMapper ??= serviceProvider.GetRequiredService<ScheduleMapper>();

        return new CourseResponse
        {
            Id = source.Id,
            Category = source.Category,
            School = schoolMapper.GetShortDTO(source.School),
            Student = source.Student.GetShortDTO(),
            InstructorId = source.Instructor.Instructor.Id,
            SchoolInstructorId = source.Instructor.Id,
            Instructor = source.Instructor.Instructor.User.GetShortDTO(),
            UsedHours = source.UsedHours,
            HoursCount = source.BaseHoursCount,
            PricePerHour = source.PricePerHour,
            NextRide =
                source.NextRide != null ? _scheduleMapper.GetShortRideDTO(source.NextRide) : null,
            OngoingRide =
                source.OngoingRide != null
                    ? _scheduleMapper.GetShortRideDTO(source.OngoingRide)
                    : null,
            CreatedAt = source.CreatedAt,
            Archived = source.Archived,
        };
    }

    public IEnumerable<ShortCourseResponse> MapToShortDTO(IEnumerable<Course> courses)
    {
        return courses.Select(GetShortDTO);
    }

    public List<LimitedCourseResponse> MapToLimitedDTO(List<Course> courses)
    {
        return courses.Select(GetLimitedDTO).ToList();
    }

    public List<CourseResponse> MapToDTO(List<Course> courses)
    {
        return courses.Select(GetDTO).ToList();
    }
}
