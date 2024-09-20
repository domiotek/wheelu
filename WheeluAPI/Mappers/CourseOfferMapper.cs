using WheeluAPI.DTO.Course.CourseOffer;
using WheeluAPI.Models;

namespace WheeluAPI.Mappers;

public class CourseOfferDTOMapper(
    CourseCategoryDTOMapper categoryMapper,
    SchoolInstructorDTOMapper instructorMapper
)
{
    public CourseOfferResponse GetDTO(CourseOffer source)
    {
        var instructors = source
            .School.ActiveInstructors.Where(i => i.AllowedCategories.Contains(source.Category))
            .ToList();

        return new CourseOfferResponse
        {
            Id = source.Id,
            Enabled = source.Enabled,
            Category = categoryMapper.GetDTO(source.Category),
            HoursCount = source.HoursCount,
            Price = source.Price,
            PricePerHour = source.PricePerHour,
            CreatedAt = source.CreatedAt,
            LastUpdatedAt = source.LastUpdatedAt,
            Instructors = instructorMapper.MapToShortDTO(instructors),
        };
    }

    public List<CourseOfferResponse> MapToDTO(List<CourseOffer> source)
    {
        return source.Select(o => GetDTO(o)).ToList();
    }
}
