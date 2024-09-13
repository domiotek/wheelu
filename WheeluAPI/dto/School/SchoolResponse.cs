using WheeluAPI.DTO.Location;
using WheeluAPI.DTO.User;
using WheeluAPI.Models;

namespace WheeluAPI.DTO.School;

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

    public required ImageResponse CoverImage { get; set; }

    public required List<City> NearbyCities { get; set; }

    public required List<CourseCategoryType> CourseOffers { get; set; }
}
