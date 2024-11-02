using WheeluAPI.DTO.Course;
using WheeluAPI.Models;

namespace WheeluAPI.Mappers;

public class CourseMapper(SchoolMapper schoolMapper, IServiceProvider serviceProvider)
{
    private ScheduleMapper? _scheduleMapper;
    private ExamMapper? _examMapper;

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
            SchoolName = source.School.Name,
            Student = source.Student.GetShortDTO(),
            Instructor = source.Instructor.Instructor.User.GetShortDTO(),
            HoursCount = source.HoursCount,
            PricePerHour = source.PricePerHour,
            CreatedAt = source.CreatedAt,
            Archived = source.Archived,
        };
    }

    public CourseResponse GetDTO(Course source)
    {
        _scheduleMapper ??= serviceProvider.GetRequiredService<ScheduleMapper>();
        _examMapper ??= serviceProvider.GetRequiredService<ExamMapper>();

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
            HoursCount = source.HoursCount,
            PricePerHour = source.PricePerHour,
            NextRide =
                source.NextRide != null ? _scheduleMapper.GetShortRideDTO(source.NextRide) : null,
            OngoingRide =
                source.OngoingRide != null
                    ? _scheduleMapper.GetShortRideDTO(source.OngoingRide)
                    : null,
            NextExam = source.NextExam != null ? _examMapper.GetShortDTO(source.NextExam) : null,
            CourseProgress = source.CourseProgress,
            CreatedAt = source.CreatedAt,
            PassedInternalExam = source.PassedInternalExam,
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

    public HoursPackageResponse GetHoursPackageDTO(HoursPackage source)
    {
        return new HoursPackageResponse
        {
            Id = source.Id,
            Status = source.Transaction?.State.ToString(),
            TransactionID = source.Transaction?.Id,
            TotalPaymentAmount = source.Transaction?.TotalAmount ?? 0,
            Course = GetShortDTO(source.Course),
            HoursCount = source.HoursCount,
            Created = source.Created,
        };
    }

    public IEnumerable<HoursPackageResponse> MapToHoursPackageDTO(IEnumerable<HoursPackage> source)
    {
        return source.Select(GetHoursPackageDTO);
    }
}
