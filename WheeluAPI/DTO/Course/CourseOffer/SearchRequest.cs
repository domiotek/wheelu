using WheeluAPI.Models;

namespace WheeluAPI.DTO.Course.CourseOffer;

public enum SortingOptions
{
    Price,
    Rating,
}

public class CourseSearchRequest
{
    public CourseCategoryType? CategoryType { get; set; }

    public required SortingOptions SortingTarget { get; set; }

    public required SortingType SortingType { get; set; }
}
