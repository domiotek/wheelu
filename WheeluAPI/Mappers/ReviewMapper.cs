using WheeluAPI.DTO.Review;
using WheeluAPI.Models;

namespace WheeluAPI.Mappers;

public class ReviewMapper(SchoolMapper schoolMapper, InstructorDTOMapper instructorMapper)
{
    public ReviewResponse GetDTO(Review source)
    {
        return new ReviewResponse
        {
            Id = source.Id,
            School = schoolMapper.GetShortDTO(source.School),
            Student = source.Student.GetShortDTO(),
            Instructor = source.Instructor is not null
                ? instructorMapper.GetShortDTO(source.Instructor)
                : null,
            Grade = source.Grade,
            Message = source.Message,
            Edited = source.Edited,
            Created = source.Created,
            Updated = source.Updated,
        };
    }

    public List<ReviewResponse> MapToDTO(List<Review> reviews)
    {
        return reviews.Select(GetDTO).ToList();
    }
}
