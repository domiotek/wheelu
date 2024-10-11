using WheeluAPI.DTO.Course.CourseOffer;
using WheeluAPI.Models;

namespace WheeluAPI.Mappers;

public class CourseOfferDTOMapper(
    CourseCategoryDTOMapper categoryMapper,
    SchoolInstructorDTOMapper instructorMapper,
    VehicleMapper vehicleMapper,
    SchoolMapper schoolMapper
)
{
    public CourseOfferResponse GetDTO(CourseOffer source)
    {
        var instructors = source
            .School.ActiveInstructors.Where(i => i.AllowedCategories.Contains(source.Category))
            .ToList();

        var vehicles = source
            .School.Vehicles.Where(v => v.AllowedIn.Contains(source.Category.Id))
            .ToList();

        return new CourseOfferResponse
        {
            Id = source.Id,
            SchoolId = source.School.Id,
            Enabled = source.Enabled,
            Category = categoryMapper.GetDTO(source.Category),
            HoursCount = source.HoursCount,
            Price = source.Price,
            PricePerHour = source.PricePerHour,
            CreatedAt = source.CreatedAt,
            LastUpdatedAt = source.LastUpdatedAt,
            Instructors = instructorMapper.MapToShortDTO(instructors),
            Vehicles = vehicleMapper.MapToShortDTO(vehicles),
        };
    }

    public CourseOfferSearchResponse GetSearchDTO(CourseOffer source)
    {
        return new CourseOfferSearchResponse
        {
            Id = source.Id,
            School = schoolMapper.GetShortDTO(source.School),
            Enabled = source.Enabled,
            Category = categoryMapper.GetDTO(source.Category),
            HoursCount = source.HoursCount,
            Price = source.Price,
        };
    }

    public List<CourseOfferResponse> MapToDTO(List<CourseOffer> source)
    {
        return source.Select(o => GetDTO(o)).ToList();
    }

    public List<CourseOfferSearchResponse> MapToSearchDTO(List<CourseOffer> source)
    {
        return source.Select(GetSearchDTO).ToList();
    }
}
