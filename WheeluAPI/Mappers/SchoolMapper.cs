using WheeluAPI.DTO.School;
using WheeluAPI.models;
using WheeluAPI.Services;

namespace WheeluAPI.Mappers;

public class SchoolMapper(IImageService imageService, ILocationService locationService)
{
    public ShortSchoolResponse GetShortDTO(School source)
    {
        return new ShortSchoolResponse
        {
            Id = source.Id,
            Hidden = source.Hidden,
            Blocked = source.Blocked,
            Name = source.Name,
            Description = source.Description,
            CoverImage = imageService.GetDTO(source.CoverImage),
        };
    }

    public SchoolResponse GetDTO(School source)
    {
        return new SchoolResponse
        {
            Id = source.Id,
            Hidden = source.Hidden,
            Blocked = source.Blocked,
            Name = source.Name,
            Description = source.Description,
            NIP = source.NIP,
            Owner = source.Owner.GetShortDTO(),
            Address = source.Address.GetDTO(),
            Established = source.Established,
            Joined = source.Joined,
            PhoneNumber = source.PhoneNumber,
            Email = source.Email ?? source.Owner.Email!,
            CoverImage = imageService.GetDTO(source.CoverImage),
            NearbyCities = source.NearbyCities.Select(locationService.GetCityDTO).ToList(),
            CourseOffers = source.CourseOffers.Select(o => o.Category.Id).Distinct().ToList(),
            VehicleCount = source.Vehicles.Count,
            Instructors = source.Instructors.Select(i => i.Instructor.Id).ToList(),
            OldestVehicleYear =
                source.Vehicles.Count > 0 ? source.Vehicles.Min(v => v.ManufacturingYear) : null,
            CoursesCount = source.Courses.Count,
            ActiveCoursesCount = source.ActiveCourses.Count,
        };
    }

    public List<ShortSchoolResponse> MapToShortDTO(List<School> source)
    {
        return source.Select(GetShortDTO).ToList();
    }

    public List<SchoolResponse> MapToDTO(List<School> source)
    {
        return source.Select(GetDTO).ToList();
    }
}
