using System.ComponentModel.DataAnnotations;

namespace WheeluAPI.DTO.Review;

public class PostReviewRequest
{
    public required decimal Grade { get; set; }

    [MaxLength(255)]
    public string? Message { get; set; }

    public required ReviewTargetType TargetType { get; set; }
}
