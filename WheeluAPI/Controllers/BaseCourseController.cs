using System.Security.Claims;
using WheeluAPI.DTO.Schedule;
using WheeluAPI.helpers;
using WheeluAPI.Services;

namespace WheeluAPI.Controllers;

public class BaseCourseController(IUserService userService, CourseService courseService)
    : BaseAPIController
{
    protected IUserService userService = userService;
    protected CourseService courseService = courseService;

    protected async Task<RequestorValidationResult> ValidateAccess(int courseID)
    {
        var result = new RequestorValidationResult();
        var requestorEmail = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var requestor = await userService.GetUserByEmailAsync(requestorEmail ?? "");

        var course = await courseService.GetCourseByIDAsync(courseID);

        if (course == null)
        {
            result.ActionResult = NotFound(new APIError { Code = APIErrorCode.EntityNotFound });
            return result;
        }

        var hasAccess = await courseService.ValidateCourseAccess(course, requestor!);

        if (!hasAccess)
        {
            result.ActionResult = BadRequest(new APIError { Code = APIErrorCode.AccessDenied });
            return result;
        }

        result.Requestor = requestor;
        result.Course = course;
        result.IsTargetStudent = await userService.HasRole(requestor!, UserRole.Student);
        return result;
    }
}
