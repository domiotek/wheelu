using System.Security.Claims;
using System.Transactions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WheeluAPI.DTO.Errors;
using WheeluAPI.DTO.Instructor;
using WheeluAPI.helpers;
using WheeluAPI.Mappers;
using WheeluAPI.Services;

namespace WheeluAPI.Controllers;

[ApiController]
[Route("/api/v1/schools/{schoolID}/instructors")]
public class SchoolInstructorController(
    ISchoolService schoolService,
    ISchoolInstructorService service,
    IUserService userService,
    IInstructorInviteService inviteService,
    SchoolInstructorDTOMapper mapper
) : BaseAPIController
{
    [HttpGet("{instructorID}")]
    [Authorize]
    [ProducesResponseType(typeof(SchoolInstructorResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSpecific(int schoolID, int instructorID)
    {
        var school = await schoolService.GetSchoolByID(schoolID);

        if (school == null)
            return NotFound();

        var instructor = school.Instructors.Find(i => i.Id == instructorID);

        if (instructor == null)
            return NotFound();
        return Ok(mapper.GetDTO(instructor));
    }

    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(List<SchoolInstructorResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSchoolInstructors(
        int schoolID,
        [FromQuery] bool IncludeArchived
    )
    {
        var school = await schoolService.GetSchoolByID(schoolID);

        if (school == null)
            return NotFound();

        if (IncludeArchived)
        {
            var userID = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await userService.GetUserByEmailAsync(userID ?? "");

            var ownsSchool = school.Owner.Email == userID;
            var isAdmin = await userService.HasRole(user!, UserRole.Administrator);

            if (!ownsSchool && !isAdmin)
                return Unauthorized(
                    new APIError<APIErrorCode> { Code = APIErrorCode.AccessDenied }
                );
        }

        return Ok(mapper.MapToDTO(IncludeArchived ? school.ActiveInstructors : school.Instructors));
    }

    [HttpPost]
    [Authorize(Roles = "SchoolManager")]
    [ProducesResponseType(typeof(List<SchoolInstructorResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> InviteInstructor(
        int schoolID,
        [FromBody] InstructorInviteRequest request
    )
    {
        var school = await schoolService.GetSchoolByID(schoolID);

        if (school == null)
            return NotFound(
                new APIError<APIErrorCode>
                {
                    Code = APIErrorCode.EntityNotFound,
                    Details = ["School not found."],
                }
            );

        var userID = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userID != school.Owner.Email)
            return BadRequest(new APIError { Code = APIErrorCode.AccessDenied });

        var result = await inviteService.ResolveInviteAsync(school, request.Email);

        if (!result.IsSuccess)
            return BadRequest(
                new APIError<SchoolInstructorInviteErrors>
                {
                    Code = result.ErrorCode,
                    Details = result.Details,
                }
            );

        return Ok();
    }

    [HttpPut("{instructorID}")]
    [Authorize(Roles = "SchoolManager")]
    [ProducesResponseType(typeof(List<SchoolInstructorResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateInstructor(
        int schoolID,
        int instructorID,
        [FromBody] SchoolInstructorUpdateRequest request
    )
    {
        var school = await schoolService.GetSchoolByID(schoolID);

        if (school == null)
            return NotFound(
                new APIError<APIErrorCode>
                {
                    Code = APIErrorCode.EntityNotFound,
                    Details = ["School not found."],
                }
            );

        var instructor = school
            .ActiveInstructors.Where(i => i.Id == instructorID)
            .SingleOrDefault();

        if (instructor == null)
            return NotFound(
                new APIError<APIErrorCode>
                {
                    Code = APIErrorCode.EntityNotFound,
                    Details = ["Instructor not found."],
                }
            );

        var userID = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (userID != school.Owner.Email)
            return BadRequest(new APIError { Code = APIErrorCode.AccessDenied });

        using (var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
        {
            bool updateResult;

            if (request.VisibilityState != null)
            {
                updateResult = await service.UpdateInstructorVisibilityAsync(
                    instructor,
                    (bool)request.VisibilityState
                );

                if (!updateResult)
                    return BadRequest(
                        new APIError<APIErrorCode>
                        {
                            Code = APIErrorCode.DbError,
                            Details = ["Failed to update visibility state."],
                        }
                    );
            }

            if (request.Properties != null)
            {
                updateResult = await service.UpdateInstructorPropertiesAsync(
                    instructor,
                    request.Properties
                );

                if (!updateResult)
                    return BadRequest(
                        new APIError<APIErrorCode>
                        {
                            Code = APIErrorCode.DbError,
                            Details = ["Failed to update properties."],
                        }
                    );
            }

            if (request.AllowedCategories != null)
            {
                updateResult = await service.UpdateInstructorAllowedCategoriesAsync(
                    instructor,
                    request.AllowedCategories
                );

                if (!updateResult)
                    return BadRequest(
                        new APIError<APIErrorCode>
                        {
                            Code = APIErrorCode.DbError,
                            Details = ["Failed to update allowed categories."],
                        }
                    );
            }

            scope.Complete();
        }

        return Ok();
    }

    [HttpDelete("{instructorID}")]
    [Authorize(Roles = "SchoolManager")]
    [ProducesResponseType(typeof(List<SchoolInstructorResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DetachInstructor(int schoolID, int instructorID)
    {
        var school = await schoolService.GetSchoolByID(schoolID);

        if (school == null)
            return NotFound(
                new APIError<APIErrorCode>
                {
                    Code = APIErrorCode.EntityNotFound,
                    Details = ["School not found."],
                }
            );

        var instructor = school
            .ActiveInstructors.Where(i => i.Id == instructorID)
            .SingleOrDefault();

        if (instructor == null)
            return NotFound(
                new APIError<APIErrorCode>
                {
                    Code = APIErrorCode.EntityNotFound,
                    Details = ["Instructor not found."],
                }
            );

        var userID = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userID != school.Owner.Email)
            return BadRequest(new APIError { Code = APIErrorCode.AccessDenied });

        var result = await service.DetachInstructorAsync(instructor);

        if (!result.IsSuccess)
            return BadRequest(
                new APIError<SchoolInstructorDetachErrors>
                {
                    Code = result.ErrorCode,
                    Details = result.Details,
                }
            );

        return Ok();
    }
}
