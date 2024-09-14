using WheeluAPI.Models;

namespace WheeluAPI.DTO.Instructor;

public class SchoolInstructorUpdateRequest
{
    public bool? VisibilityState { get; set; }

    public SchoolInstructorProperties? Properties { get; set; }

    public List<CourseCategoryType>? AllowedCategories { get; set; }
}
