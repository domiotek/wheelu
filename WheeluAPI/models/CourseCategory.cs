using System.ComponentModel.DataAnnotations;

namespace WheeluAPI.Models;

public enum CourseCategoryType
{
    AM,
    A,
    A1,
    A2,
    B,
    B1,
    C,
    C1,
    D,
    D1,
    T,
}

public class CourseCategory
{
    [Key]
    public CourseCategoryType Id { get; set; }

    public required string Name { get; set; }

    public int? RequiredAge { get; set; }

    public bool SpecialRequirements { get; set; } = false;

    public virtual required List<CourseOffer> CourseOffers { get; set; }
}
