namespace WheeluAPI.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WheeluAPI.DTO.Errors;
using WheeluAPI.DTO.SchoolApplication;
using WheeluAPI.helpers;
using WheeluAPI.models;
using WheeluAPI.Services;

[ApiController]
[Route("/api/v1/applications")]
public class SchoolApplicationController(
    ISchoolApplicationService service,
    ISchoolService schoolService,
    IUserService userService
) : BaseAPIController
{
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(APIError), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> PostApplication([FromBody] SchoolApplicationData application)
    {
        var validationResult = await service.ValidateApplicationDataAsync(application);

        if (!validationResult.IsValid)
        {
            return ValidationProblem(validationResult.Errors);
        }

        SchoolApplication? existingApplication = await service.FindExistingApplication(application);
        if (existingApplication != null)
        {
            if (existingApplication.Status == SchoolApplicationState.Pending)
                return BadRequest(
                    new APIError<SchoolApplicationErrorCodes>
                    {
                        Code = SchoolApplicationErrorCodes.ApplicationAlreadyFiled,
                    }
                );

            var timeDiff = DateTime.UtcNow - existingApplication.ResolvedAt;
            if (
                existingApplication.Status == SchoolApplicationState.Rejected
                && timeDiff != null
                && ((TimeSpan)timeDiff).TotalDays < 7
            )
                return BadRequest(
                    new APIError<SchoolApplicationErrorCodes>
                    {
                        Code = SchoolApplicationErrorCodes.RejectedTooSoon,
                    }
                );
        }

        if (await schoolService.FindExistingSchool(application) != null)
            return BadRequest(
                new APIError<SchoolApplicationErrorCodes>
                {
                    Code = SchoolApplicationErrorCodes.SchoolExists,
                }
            );

        if (await userService.GetUserByEmailAsync(application.Email) != null)
            return BadRequest(
                new APIError<SchoolApplicationErrorCodes>
                {
                    Code = SchoolApplicationErrorCodes.UserExists,
                }
            );

        try
        {
            var newApplication = await service.CreateApplication(application);

            await service.SendInitialMail(newApplication);
        }
        catch (Exception ex)
        {
            return Problem(ex.Message);
        }

        return StatusCode(201);
    }

    [HttpGet("{applicationID}")]
    [Authorize(Roles = "Administrator")]
    [ProducesResponseType(typeof(SchoolApplicationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetApplication(int applicationID)
    {
        var application = await service.GetApplicationByID(applicationID);

        if (application == null)
            return NotFound();
        return Ok(service.MapToDTO(application));
    }

    [HttpGet]
    [Authorize(Roles = "Administrator")]
    [ProducesResponseType(typeof(SchoolApplicationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetAllApplications(
        [FromQuery] OptionalPagingMetadata pagingMeta
    )
    {
        if (pagingMeta.PageNumber != null)
        {
            int appliedPageSize;

            PagingMetadata metadata =
                new() { PageNumber = (int)pagingMeta.PageNumber, PageSize = pagingMeta.PageSize };

            var results = await service
                .GetApplications(metadata, out appliedPageSize)
                .ToListAsync();

            return Paginated(service.MapToDTO(results), await service.Count(), appliedPageSize);
        }

        var applications = await service.GetAllApplications();
        return Paginated(service.MapToDTO(applications), applications.Count, applications.Count);
    }

    [HttpPost("{id}/reject")]
    [Authorize(Roles = "Administrator")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(APIError<ApplicationRejectErrors>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RejectApplication(
        int id,
        [FromBody] ApplicationRejectRequest data
    )
    {
        var application = await service.GetApplicationByID(id);

        if (application == null)
            return NotFound(
                new APIError<ApplicationRejectErrors>
                {
                    Code = ApplicationRejectErrors.ApplicationNotFound,
                }
            );

        var reason = data.Reason switch
        {
            "InvalidData" => RejectionReason.InvalidData,
            "PlatformSaturated" => RejectionReason.PlatformSaturated,
            "BadReputation" => RejectionReason.BadReputation,
            _ => RejectionReason.Unspecified,
        };

        var result = await service.RejectApplication(application, reason, data.Message);

        if (!result.IsSuccess)
            return BadRequest(new APIError<ApplicationRejectErrors> { Code = result.ErrorCode });

        return Ok();
    }

    [HttpPost("{id}/accept")]
    [Authorize(Roles = "Administrator")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(APIError<ApplicationAcceptErrors>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AcceptApplication(
        int id,
        [FromBody] SchoolRegistrationData requestData
    )
    {
        var application = await service.GetApplicationByID(id);

        if (application == null)
            return NotFound(
                new APIError<ApplicationAcceptErrors>
                {
                    Code = ApplicationAcceptErrors.ApplicationNotFound,
                }
            );

        var result = await service.AcceptApplication(application, requestData);

        if (!result.IsSuccess)
            return BadRequest(new APIError<ApplicationAcceptErrors> { Code = result.ErrorCode });

        return Ok();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrator")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(APIError<DeleteApplicationErrors>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteApplication(int id)
    {
        var application = await service.GetApplicationByID(id);

        if (application == null)
            return NotFound(
                new APIError<DeleteApplicationErrors>
                {
                    Code = DeleteApplicationErrors.ApplicationNotFound,
                }
            );

        var result = await service.DeleteApplication(application);

        if (!result)
            return BadRequest(
                new APIError<DeleteApplicationErrors> { Code = DeleteApplicationErrors.DbError }
            );

        return Ok();
    }
}
