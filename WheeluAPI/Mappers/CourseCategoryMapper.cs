using WheeluAPI.DTO.Course;
using WheeluAPI.Models;

namespace WheeluAPI.Mappers;

public class CourseCategoryDTOMapper
{
    public CourseCategoryResponse GetDTO(CourseCategory source)
    {
        return new CourseCategoryResponse
        {
            Id = source.Id,
            Name = source.Name,
            RequiredAge = source.RequiredAge,
            SpecialRequirements = source.SpecialRequirements,
        };
    }
}
