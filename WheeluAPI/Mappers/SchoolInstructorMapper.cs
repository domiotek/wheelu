using WheeluAPI.DTO.Instructor;
using WheeluAPI.Models;

namespace WheeluAPI.Mappers;

public class SchoolInstructorDTOMapper(CourseMapper courseMapper, SchoolMapper schoolMapper)
{
    public SchoolInstructorResponse GetDTO(SchoolInstructor source)
    {
        return new SchoolInstructorResponse
        {
            Id = source.Id,
            Instructor = new ShortInstructorResponse
            {
                Id = source.Instructor.Id,
                User = source.Instructor.User.GetShortDTO(),
                Grade = source.Instructor.Grade,
                ReviewCount = source.Instructor.Reviews.Count,
            },
            School = schoolMapper.GetShortDTO(source.School),
            Detached = source.Detached,
            Visible = source.Visible,
            EmploymentRecords = source
                .EmploymentRecords.Select(rec => new EmploymentRecordResponse
                {
                    Id = rec.Id,
                    StartTime = rec.StartTime,
                    EndTime = rec.EndTime,
                })
                .ToList(),
            AssignedCourses = courseMapper.MapToLimitedDTO(source.AssignedCourses),
            MaximumConcurrentStudents = source.MaximumConcurrentStudents,
            AllowedCategories = source.AllowedCategories.Select(c => c.Id).ToList(),
        };
    }

    public LimitedSchoolInstructorResponse GetLimitedDTO(SchoolInstructor source)
    {
        return new LimitedSchoolInstructorResponse
        {
            Id = source.Id,
            Visible = source.Visible,
            Instructor = new ShortInstructorResponse
            {
                Id = source.Instructor.Id,
                User = source.Instructor.User.GetShortDTO(),
                Grade = source.Instructor.Grade,
                ReviewCount = source.Instructor.Reviews.Count,
            },
            SchoolId = source.School.Id,
            AssignedCoursesCount = source.AssignedCourses.Count,
            ActiveCoursesCount = source.ActiveCourses.Count,
            MaximumConcurrentStudents = source.MaximumConcurrentStudents,
            AllowedCategories = source.AllowedCategories.Select(c => c.Id).ToList(),
        };
    }

    public ShortSchoolInstructorResponse GetShortDTO(SchoolInstructor source)
    {
        return new ShortSchoolInstructorResponse
        {
            Id = source.Id,
            Instructor = new ShortInstructorResponse
            {
                Id = source.Instructor.Id,
                User = source.Instructor.User.GetShortDTO(),
                Grade = source.Instructor.Grade,
                ReviewCount = source.Instructor.Reviews.Count,
            },
            SchoolId = source.School.Id,
        };
    }

    public List<SchoolInstructorResponse> MapToDTO(List<SchoolInstructor> source)
    {
        return source.Select(GetDTO).ToList();
    }

    public List<LimitedSchoolInstructorResponse> MapToLimitedDTO(List<SchoolInstructor> source)
    {
        return source.Select(GetLimitedDTO).ToList();
    }

    public IEnumerable<ShortSchoolInstructorResponse> MapToShortDTO(
        IEnumerable<SchoolInstructor> source
    )
    {
        return source.Select(GetShortDTO);
    }
}
