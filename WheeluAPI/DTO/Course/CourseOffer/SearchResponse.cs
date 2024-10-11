using WheeluAPI.DTO.School;

namespace WheeluAPI.DTO.Course.CourseOffer;

public class CourseOfferSearchResponse
{
    public int Id { get; set; }

    public required CourseCategoryResponse Category { get; set; }

    public required ShortSchoolResponse School { get; set; }

    public required bool Enabled { get; set; }

    public required int HoursCount { get; set; }

    public required decimal Price { get; set; }
}
