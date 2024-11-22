using WheeluAPI.DTO.Instructor;
using WheeluAPI.Models;

namespace WheeluAPI.Mappers;

public class InstructorDTOMapper(SchoolInstructorDTOMapper instructorMapper)
{
    public InstructorResponse GetDTO(Instructor source)
    {
        return new InstructorResponse
        {
            Id = source.Id,
            User = source.User.GetShortDTO(),
            EmploymentHistory = instructorMapper.MapToDTO(source.EmploymentHistory),
            Grade = source.Grade,
            ReviewCount = source.Reviews.Count,
        };
    }

    public List<InstructorResponse> MapToDTO(List<Instructor> source)
    {
        return source.Select(GetDTO).ToList();
    }

    public ShortInstructorResponse GetShortDTO(Instructor source)
    {
        return new ShortInstructorResponse
        {
            Id = source.Id,
            User = source.User.GetShortDTO(),
            Grade = source.Grade,
            ReviewCount = source.Reviews.Count,
        };
    }

    public List<ShortInstructorResponse> MapToShortDTO(List<Instructor> source)
    {
        return source.Select(GetShortDTO).ToList();
    }
}
