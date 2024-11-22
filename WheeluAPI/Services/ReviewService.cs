using WheeluAPI.DTO.Errors;
using WheeluAPI.DTO.Review;
using WheeluAPI.helpers;
using WheeluAPI.Models;

namespace WheeluAPI.Services;

public class ReviewService(ApplicationDbContext dbContext) : BaseService
{
    public ValueTask<Review?> GetReviewByIDAsync(int id)
    {
        return dbContext.Reviews.FindAsync(id);
    }

    public Review? GetReviewFromCourseByTargetAsync(Course course, ReviewTargetType target)
    {
        return course
            .Reviews.Where(r =>
                (target is ReviewTargetType.Instructor && r.Instructor is not null)
                || (target is ReviewTargetType.School)
            )
            .SingleOrDefault();
    }

    public async Task<ServiceActionWithDataResult<PostReviewErrors, Review>> PostReviewAsync(
        Course course,
        PostReviewRequest reviewData
    )
    {
        var result = new ServiceActionWithDataResult<PostReviewErrors, Review>();

        if (!ValidateGrade(reviewData.Grade))
        {
            result.ErrorCode = PostReviewErrors.InvalidGrade;
            result.Details = ["Grade must be between 1 and 5, with step 0.5."];
            return result;
        }

        var review = GetReviewFromCourseByTargetAsync(course, reviewData.TargetType);

        if (review is null)
        {
            review = new Review
            {
                School = course.School,
                Course = course,
                Student = course.Student,
                Instructor =
                    reviewData.TargetType is ReviewTargetType.Instructor
                        ? course.Instructor.Instructor
                        : null,
                Grade = reviewData.Grade,
                Message = reviewData.Message,
                Edited = false,
                Created = DateTime.UtcNow,
                Updated = DateTime.UtcNow,
            };
            dbContext.Reviews.Add(review);
        }
        else
        {
            review.Updated = DateTime.UtcNow;
            review.Edited = true;
            review.Grade = reviewData.Grade;
            review.Message = reviewData.Message;
            dbContext.Reviews.Update(review);
        }

        if (await dbContext.SaveChangesAsync() == 0)
        {
            result.ErrorCode = PostReviewErrors.DbError;
            return result;
        }

        result.IsSuccess = true;
        result.Data = review;
        return result;
    }

    public async Task<bool> DeleteReviewAsync(Review review)
    {
        dbContext.Reviews.Remove(review);

        if (await dbContext.SaveChangesAsync() == 0)
            return false;

        return true;
    }

    private bool ValidateGrade(decimal value)
    {
        if (value < 1 || value > 5)
            return false;

        return value * 10 % 5 == 0;
    }
}
