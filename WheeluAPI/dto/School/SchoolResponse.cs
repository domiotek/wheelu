using WheeluAPI.DTO.Location;
using WheeluAPI.DTO.User;
using WheeluAPI.Models;

namespace WheeluAPI.DTO.School;

public class ShortSchoolResponse
{
    public int Id { get; set; }

    public required string Name { get; set; }

    public string? Description { get; set; }

    public required bool Hidden { get; set; }

    public required bool Blocked { get; set; }

    public required ImageResponse CoverImage { get; set; }
}

public class SchoolResponse
{
    public int Id { get; set; }

    public required string Name { get; set; }

    public string? Description { get; set; }

    public required string NIP { get; set; }

    public required bool Hidden { get; set; }

    public required bool Blocked { get; set; }

    public required ShortUserResponse Owner { get; set; }

    public required AddressResponse Address { get; set; }

    public required DateOnly Established { get; set; }

    public required DateTime Joined { get; set; }

    public required string PhoneNumber { get; set; }

    public required string Email { get; set; }

    public required ImageResponse CoverImage { get; set; }

    public required List<City> NearbyCities { get; set; }

    public required List<CourseCategoryType> CourseOffers { get; set; }

    public required int VehicleCount { get; set; }

    public required List<int> Instructors { get; set; }

    public int? OldestVehicleYear { get; set; }

    public required int CoursesCount { get; set; }

    public required int ActiveCoursesCount { get; set; }
}
