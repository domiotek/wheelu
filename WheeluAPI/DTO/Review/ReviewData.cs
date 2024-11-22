using System.ComponentModel.DataAnnotations;

namespace WheeluAPI.DTO.Review;

public class ReviewData
{
    public required decimal Grade { get; set; }

    [MaxLength(255)]
    public string? Message { get; set; }
}
