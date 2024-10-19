using WheeluAPI.DTO.Course.InstructorChangeRequest;
using WheeluAPI.Models;

namespace WheeluAPI.Mappers;

public class InstructorChangeRequestMapper(
    CourseMapper courseMapper,
    SchoolInstructorDTOMapper instructorMapper
)
{
    public InstructorChangeResponse GetDTO(InstructorChangeRequest source)
    {
        return new InstructorChangeResponse
        {
            Id = source.Id,
            Status = source.Status,
            Requestor = source.Requestor.GetShortDTO(),
            RequestorType = source.RequestorType,
            Course = courseMapper.GetShortDTO(source.Course),
            RequestedInstructor =
                source.RequestedInstructor != null
                    ? instructorMapper.GetShortDTO(source.RequestedInstructor)
                    : null,
            Note = source.Note,
            RequestedAt = source.RequestedAt,
            LastStatusChange = source.LastStatusChange,
        };
    }

    public IEnumerable<InstructorChangeResponse> MapToDTO(
        IEnumerable<InstructorChangeRequest> source
    )
    {
        return source.Select(GetDTO);
    }
}
