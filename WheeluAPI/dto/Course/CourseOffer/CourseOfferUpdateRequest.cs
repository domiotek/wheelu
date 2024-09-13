namespace WheeluAPI.DTO.Course.CourseOffer;

public class CourseOfferUpdateRequest
{
    public required bool Enabled { get; set; }

    public required int HoursCount { get; set; }

    public required decimal Price { get; set; }

    public required decimal PricePerHour { get; set; }
}
