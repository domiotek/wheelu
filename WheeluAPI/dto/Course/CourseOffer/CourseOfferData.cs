namespace WheeluAPI.DTO.Course.CourseOffer;

public class CourseOfferData
{
    public required int SchoolId { get; set; }

    public required int Category { get; set; }

    public required bool Enabled { get; set; }

    public required int HoursCount { get; set; }

    public required decimal Price { get; set; }

    public required decimal PricePerHour { get; set; }
}
