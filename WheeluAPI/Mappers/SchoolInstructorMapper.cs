using WheeluAPI.DTO.Instructor;
using WheeluAPI.Models;

namespace WheeluAPI.Mappers;

public class SchoolInstructorDTOMapper
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
            },
            SchoolId = source.School.Id,
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
            },
            SchoolId = source.School.Id,
            MaximumConcurrentStudents = source.MaximumConcurrentStudents,
            AllowedCategories = source.AllowedCategories.Select(c => c.Id).ToList(),
        };
    }

    public List<SchoolInstructorResponse> MapToDTO(List<SchoolInstructor> source)
    {
        return source.Select(GetDTO).ToList();
    }

    public List<ShortSchoolInstructorResponse> MapToShortDTO(List<SchoolInstructor> source)
    {
        return source.Select(GetShortDTO).ToList();
    }
}
