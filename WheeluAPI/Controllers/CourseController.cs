using System.Security.Claims;
using System.Transactions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WheeluAPI.DTO.Course;
using WheeluAPI.DTO.Errors;
using WheeluAPI.DTO.Transaction;
using WheeluAPI.helpers;
using WheeluAPI.Helpers;
using WheeluAPI.Mappers;
using WheeluAPI.Services;

namespace WheeluAPI.Controllers;

[ApiController]
[Route("/api/v1/schools/{schoolID}/courses")]
public class CourseController(
    ICourseOfferService offerService,
    ISchoolService schoolService,
    ISchoolInstructorService instructorService,
    IUserService userService,
    TransactionService transactionService,
    CourseService courseService,
    CourseMapper mapper
) : BaseAPIController
{
    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(List<ShortCourseResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSchoolCoursesAsync(
        int schoolID,
        [FromQuery] OptionalPagingMetadata pagingMeta
    )
    {
        var school = await schoolService.GetSchoolByID(schoolID);

        if (school == null)
        {
            return BadRequest(
                new APIError { Code = APIErrorCode.EntityNotFound, Details = ["School not found."] }
            );
        }

        if (pagingMeta.PageNumber != null)
        {
            int appliedPageSize;

            PagingMetadata metadata =
                new() { PageNumber = (int)pagingMeta.PageNumber, PageSize = pagingMeta.PageSize };

            var query = courseService.GetCoursesPageAsync(metadata, out appliedPageSize);

            var results = await query.Where(c => c.School == school).ToListAsync();

            return Paginated(
                mapper.MapToShortDTO(results),
                await courseService.CountAsync(school),
                appliedPageSize
            );
        }

        return Paginated(
            mapper.MapToShortDTO(school.Courses),
            school.Courses.Count,
            school.Courses.Count
        );
    }

    [HttpGet("/api/v1/courses/{courseID}")]
    [Authorize]
    [ProducesResponseType(typeof(List<CourseResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCourseAsync(int courseID)
    {
        var requestorEmail = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var requestor = await userService.GetUserByEmailAsync(requestorEmail ?? "");

        var course = await courseService.GetCourseByIDAsync(courseID);

        if (course == null)
            return NotFound(new APIError { Code = APIErrorCode.EntityNotFound });

        var hasSchoolAccess = await schoolService.ValidateSchoolManagementAccess(
            course.School,
            requestorEmail!,
            SchoolManagementAccessMode.All
        );

        var isTargetStudent = course.Student.Id == requestor!.Id;

        if (!isTargetStudent && !hasSchoolAccess)
            return BadRequest(new APIError { Code = APIErrorCode.AccessDenied });

        return Ok(mapper.GetDTO(course));
    }

    [HttpPost("/api/v1/offers/{offerID}/purchase")]
    [Authorize(Roles = "Student")]
    [ProducesResponseType(typeof(BuyCourseResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> BuyCourseAsync(
        [FromBody] CreateCourseRequest request,
        int offerID
    )
    {
        using (var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
        {
            var offer = await offerService.GetOfferByIDAsync(offerID);

            if (offer == null || !offer.Enabled)
                return BadRequest(
                    new APIError
                    {
                        Code = APIErrorCode.EntityNotFound,
                        Details = ["Offer not found."],
                    }
                );

            var instructor = await instructorService.GetInstructorByIDAsync(request.InstructorId);

            if (instructor == null)
                return BadRequest(
                    new APIError
                    {
                        Code = APIErrorCode.EntityNotFound,
                        Details = ["Instructor not found"],
                    }
                );

            var userID = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await userService.GetUserByEmailAsync(userID ?? "");

            var courseResult = await courseService.CreateCourseAsync(
                new CourseData
                {
                    student = user!,
                    instructor = instructor,
                    offer = offer,
                }
            );

            if (!courseResult.IsSuccess)
                return BadRequest(
                    new APIError<CourseCreationErrors>
                    {
                        Code = courseResult.ErrorCode,
                        Details = courseResult.Details,
                    }
                );

            var transactionCreateRequest = new CreateTransactionRequest
            {
                ClientTotalAmount = request.TotalAmount,
                Payer = user!,
                Course = courseResult.Data!,
                Offer = offer,
            };

            var result = await transactionService.CreateTransaction(transactionCreateRequest);

            if (!result.IsSuccess)
            {
                return BadRequest(
                    new APIError<CreateTransactionErrors>
                    {
                        Code = result.ErrorCode,
                        Details = result.Details,
                    }
                );
            }

            scope.Complete();
            return Ok(new BuyCourseResponse { PaymentUrl = result.Data!.PaymentUrl });
        }
    }
}
