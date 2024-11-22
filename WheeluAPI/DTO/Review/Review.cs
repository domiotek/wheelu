using WheeluAPI.DTO.Instructor;
using WheeluAPI.DTO.School;
using WheeluAPI.DTO.User;

namespace WheeluAPI.DTO.Review;

public class ReviewResponse
{
    public required int Id { get; set; }

    public required ShortSchoolResponse School { get; set; }

    public required ShortInstructorResponse? Instructor { get; set; }

    public required ShortUserResponse Student { get; set; }

    public required decimal Grade { get; set; }

    public required bool Edited { get; set; }

    public required string? Message { get; set; }

    public required DateTime Created { get; set; }

    public required DateTime Updated { get; set; }
}
