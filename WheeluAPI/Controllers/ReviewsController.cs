using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WheeluAPI.DTO.Course;
using WheeluAPI.DTO.Errors;
using WheeluAPI.DTO.Review;
using WheeluAPI.helpers;
using WheeluAPI.Mappers;
using WheeluAPI.Services;

namespace WheeluAPI.Controllers;

[ApiController]
[Route("/api/v1")]
public class ReviewsController(
    ReviewMapper mapper,
    ISchoolService schoolService,
    InstructorService instructorService,
    UserService userService,
    CourseService courseService,
    ReviewService service
) : BaseCourseController(userService, courseService)
{
    [HttpGet("schools/{schoolID}/reviews")]
    [Authorize]
    [ProducesResponseType(typeof(List<ReviewResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSchoolReviewsAsync(int schoolID)
    {
        var school = await schoolService.GetSchoolByID(schoolID);

        if (school is null)
            return BadRequest(
                new APIError { Code = APIErrorCode.EntityNotFound, Details = ["School not found."] }
            );

        return Ok(mapper.MapToDTO(school.Reviews));
    }

    [HttpGet("instructors/{instructorID}/reviews")]
    [Authorize]
    [ProducesResponseType(typeof(List<ReviewResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetInstructorReviewsAsync(int instructorID)
    {
        var instructor = await instructorService.GetByIDAsync(instructorID);

        if (instructor is null)
            return BadRequest(
                new APIError
                {
                    Code = APIErrorCode.EntityNotFound,
                    Details = ["Instructor not found."],
                }
            );

        return Ok(mapper.MapToDTO(instructor.Reviews));
    }

    [HttpGet("courses/{courseID}/reviews")]
    [Authorize]
    [ProducesResponseType(typeof(List<ReviewResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCourseReviewsAsync(int courseID)
    {
        var course = await courseService.GetCourseByIDAsync(courseID);

        if (course is null)
            return BadRequest(
                new APIError { Code = APIErrorCode.EntityNotFound, Details = ["Course not found."] }
            );

        return Ok(mapper.MapToDTO(course.Reviews));
    }

    [HttpPost("courses/{courseID}/review")]
    [Authorize(Roles = "Student")]
    [ProducesResponseType(typeof(BuyCourseResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> PostReviewAsync(
        [FromBody] PostReviewRequest data,
        int courseID
    )
    {
        var validationResult = await ValidateAccess(courseID);

        if (validationResult.ActionResult != null)
            return validationResult.ActionResult;

        var course = validationResult.Course!;

        var review = await service.PostReviewAsync(course, data);

        if (!review.IsSuccess)
            return BadRequest(
                new APIError<PostReviewErrors> { Code = review.ErrorCode, Details = review.Details }
            );

        return Ok();
    }
}
