using System.Security.Claims;
using System.Transactions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WheeluAPI.DTO.Course.InstructorChangeRequest;
using WheeluAPI.DTO.Errors;
using WheeluAPI.helpers;
using WheeluAPI.Helpers;
using WheeluAPI.Mappers;
using WheeluAPI.Models;
using WheeluAPI.Services;

namespace WheeluAPI.Controllers;

[ApiController]
[Route("/api/v1/schools/{schoolID}/instructor-change-requests")]
public class InstructorChangeController(
    ISchoolService schoolService,
    CourseService courseService,
    IUserService userService,
    ISchoolInstructorService schoolInstructorService,
    InstructorChangeRequestService service,
    InstructorChangeRequestMapper mapper
) : BaseAPIController
{
    [HttpGet]
    [Authorize(Roles = "SchoolManager,Administrator")]
    [ProducesResponseType(typeof(List<InstructorChangeResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSchoolRequestsAsync(
        int schoolID,
        [FromQuery] OptionalPagingMetadata pagingMeta
    )
    {
        var school = await schoolService.GetSchoolByID(schoolID);

        if (school == null)
        {
            return NotFound(
                new APIError { Code = APIErrorCode.EntityNotFound, Details = ["School not found."] }
            );
        }

        var requestorEmail = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (
            !await schoolService.ValidateSchoolManagementAccess(
                school,
                requestorEmail!,
                SchoolManagementAccessMode.AllPrivileged
            )
        )
        {
            return BadRequest(new APIError { Code = APIErrorCode.AccessDenied });
        }

        if (pagingMeta.PageNumber != null)
        {
            int appliedPageSize;

            PagingMetadata metadata =
                new() { PageNumber = (int)pagingMeta.PageNumber, PageSize = pagingMeta.PageSize };

            var query = service.GetRequestsPage(school, metadata, out appliedPageSize);

            var results = await query.ToListAsync();

            return Paginated(
                mapper.MapToDTO(results).ToList(),
                await service.CountAsync(school),
                appliedPageSize
            );
        }

        var allRequests = service.GetRequests(school).ToList();

        return Paginated(
            mapper.MapToDTO(allRequests).ToList(),
            allRequests.Count,
            allRequests.Count
        );
    }

    [HttpGet("{requestID}")]
    [Authorize(Roles = "SchoolManager,Administrator")]
    [ProducesResponseType(typeof(InstructorChangeResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetRequestAsync(int schoolID, int requestID)
    {
        var school = await schoolService.GetSchoolByID(schoolID);

        if (school == null)
        {
            return NotFound(
                new APIError { Code = APIErrorCode.EntityNotFound, Details = ["School not found."] }
            );
        }

        var requestorEmail = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (
            !await schoolService.ValidateSchoolManagementAccess(
                school,
                requestorEmail!,
                SchoolManagementAccessMode.AllPrivileged
            )
        )
        {
            return BadRequest(new APIError { Code = APIErrorCode.AccessDenied });
        }

        var request = await service.GetRequestByIDAsync(requestID);

        if (request == null)
            return NotFound(
                new APIError
                {
                    Code = APIErrorCode.EntityNotFound,
                    Details = ["Request not found."],
                }
            );

        return Ok(mapper.GetDTO(request));
    }

    [HttpGet("/api/v1/courses/{courseID}/instructor-change-request")]
    [Authorize(Roles = "Student,Instructor")]
    [ProducesResponseType(typeof(InstructorChangeResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetRequestFromCourseByRequestorAsync(int courseID)
    {
        var course = await courseService.GetCourseByIDAsync(courseID);

        if (course == null)
            return NotFound(
                new APIError { Code = APIErrorCode.EntityNotFound, Details = ["Course not found."] }
            );

        var requestorEmail = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (
            course.Instructor.Instructor.User.Email != requestorEmail
            && course.Student.Email != requestorEmail
        )
            return BadRequest(new APIError { Code = APIErrorCode.AccessDenied });

        var request = await service
            .PrepareQuery()
            .Where(r => r.Course.Id == courseID)
            .Where(r => r.Requestor.Email == requestorEmail)
            .FirstOrDefaultAsync();

        if (request == null)
            return Ok(null);

        return Ok(mapper.GetDTO(request));
    }

    [HttpPost("/api/v1/courses/{courseID}/instructor-change-request")]
    [Authorize(Roles = "Instructor,Student")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(APIError), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> PostRequestAsync(
        int courseID,
        [FromBody] CreateRequestData request
    )
    {
        var course = await courseService.GetCourseByIDAsync(courseID);

        if (course == null)
            return NotFound(
                new APIError { Code = APIErrorCode.EntityNotFound, Details = ["Course not found."] }
            );

        var requestorEmail = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (
            course.Instructor.Instructor.User.Email != requestorEmail
            && course.Student.Email != requestorEmail
        )
            return BadRequest(new APIError { Code = APIErrorCode.AccessDenied });

        var requestor = await userService.GetUserByEmailAsync(requestorEmail!);

        using (var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
        {
            var instructor =
                request.InstructorId != null
                    ? await schoolInstructorService.GetInstructorByIDAsync(
                        (int)request.InstructorId
                    )
                    : null;

            var requestData = new InstructorChangeData
            {
                Course = course,
                Requestor = requestor!,
                RequestedInstructor = instructor,
                Note = request.Note,
            };

            var requestResult = await service.CreateRequestAsync(requestData);

            if (!requestResult.IsSuccess)
                return BadRequest(
                    new APIError<CreateInstructorChangeRequestErrors>
                    {
                        Code = requestResult.ErrorCode,
                        Details = requestResult.Details,
                    }
                );

            scope.Complete();
        }

        return StatusCode(201);
    }

    [HttpPut("{requestID}")]
    [Authorize(Roles = "SchoolManager")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(APIError), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> PutRequestStatusAsync(
        int schoolID,
        int requestID,
        [FromBody] UpdateRequestStatusData request
    )
    {
        var school = await schoolService.GetSchoolByID(schoolID);

        if (school == null)
        {
            return NotFound(
                new APIError { Code = APIErrorCode.EntityNotFound, Details = ["School not found."] }
            );
        }

        var requestorEmail = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (
            !await schoolService.ValidateSchoolManagementAccess(
                school,
                requestorEmail!,
                SchoolManagementAccessMode.AllPrivileged
            )
        )
        {
            return BadRequest(new APIError { Code = APIErrorCode.AccessDenied });
        }

        var changeRequest = await service.GetRequestByIDAsync(requestID);

        if (changeRequest == null)
            return NotFound(
                new APIError
                {
                    Code = APIErrorCode.EntityNotFound,
                    Details = ["Request not found."],
                }
            );

        if (request.NewStatus == RequestStatus.Canceled)
            return BadRequest(
                new APIError<UpdateInstructorChangeRequestErrors>
                {
                    Code = UpdateInstructorChangeRequestErrors.InvalidState,
                }
            );

        var requestResult = await service.UpdateRequestStatusAsync(
            changeRequest,
            request.NewStatus
        );

        if (!requestResult.IsSuccess)
            return BadRequest(
                new APIError<UpdateInstructorChangeRequestErrors>
                {
                    Code = requestResult.ErrorCode,
                    Details = requestResult.Details,
                }
            );

        return Ok(mapper.GetDTO(changeRequest));
    }

    [HttpDelete("/api/v1/courses/{courseID}/instructor-change-request")]
    [Authorize(Roles = "Student,Instructor")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(APIError), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CancelRequestAsync(int courseID)
    {
        var course = await courseService.GetCourseByIDAsync(courseID);

        if (course == null)
            return NotFound(
                new APIError { Code = APIErrorCode.EntityNotFound, Details = ["Course not found."] }
            );

        var requestorEmail = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (
            course.Instructor.Instructor.User.Email != requestorEmail
            && course.Student.Email != requestorEmail
        )
            return BadRequest(new APIError { Code = APIErrorCode.AccessDenied });

        var request = await service
            .PrepareQuery()
            .Where(r => r.Course.Id == courseID)
            .Where(r => r.Requestor.Email == requestorEmail)
            .Where(r => r.Status == RequestStatus.Pending)
            .FirstOrDefaultAsync();

        if (request == null)
            return NotFound(
                new APIError
                {
                    Code = APIErrorCode.EntityNotFound,
                    Details = ["Request not found."],
                }
            );

        var requestResult = await service.UpdateRequestStatusAsync(request, RequestStatus.Canceled);

        if (!requestResult.IsSuccess)
            return BadRequest(
                new APIError<UpdateInstructorChangeRequestErrors>
                {
                    Code = requestResult.ErrorCode,
                    Details = requestResult.Details,
                }
            );

        return Ok();
    }
}
