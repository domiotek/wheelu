using WheeluAPI.Models;

namespace WheeluAPI.DTO.Course;

public class CourseCategoryResponse
{
    public required CourseCategoryType Id { get; set; }

    public required string Name { get; set; }

    public int? RequiredAge { get; set; }

    public required bool SpecialRequirements { get; set; }
}
