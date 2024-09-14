namespace WheeluAPI.Controllers;

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WheeluAPI.DTO.Errors;
using WheeluAPI.DTO.School;
using WheeluAPI.helpers;
using WheeluAPI.models;
using WheeluAPI.Services;

[ApiController]
[Route("/api/v1/schools")]
public class SchoolController(ISchoolService service, IUserService userService) : BaseAPIController
{
    [HttpGet("{schoolID}")]
    [Authorize]
    [ProducesResponseType(typeof(SchoolResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSchool(int schoolID)
    {
        var school = await service.GetSchoolByID(schoolID);

        if (school == null)
            return NotFound();
        return Ok(service.GetDTO(school));
    }

    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(SchoolResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetAllSchools([FromQuery] OptionalPagingMetadata pagingMeta)
    {
        if (pagingMeta.PageNumber != null)
        {
            int appliedPageSize;

            PagingMetadata metadata =
                new() { PageNumber = (int)pagingMeta.PageNumber, PageSize = pagingMeta.PageSize };

            var results = await service.GetSchools(metadata, out appliedPageSize).ToListAsync();

            return Paginated(service.MapToDTO(results), await service.Count(), appliedPageSize);
        }

        var schools = await service.GetAllSchools();
        return Paginated(service.MapToDTO(schools), schools.Count, schools.Count);
    }

    [HttpPut("{schoolID}")]
    [Authorize(Roles = "Administrator,SchoolManager")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateSchool(
        int schoolID,
        [FromForm] SchoolUpdateRequest requestData
    )
    {
        var school = await service.GetSchoolByID(schoolID);

        if (school == null)
            return NotFound(
                new APIError<UpdateSchoolErrors> { Code = UpdateSchoolErrors.SchoolNotFound }
            );

        var userID = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await userService.GetUserByEmailAsync(userID ?? "");

        var ownsSchool = school.Owner.Id == userID;
        var isAdmin = await userService.HasRole(user!, UserRole.Administrator);

        if (!ownsSchool && !isAdmin)
            return Unauthorized(
                new APIError<UpdateSchoolErrors> { Code = UpdateSchoolErrors.AccessDenied }
            );

        var result = await service.UpdateSchool(
            school,
            requestData,
            isAdmin ? SchoolUpdateMode.Administrator : SchoolUpdateMode.Owner
        );

        if (!result.IsSuccess)
            return BadRequest(new APIError<UpdateSchoolErrors> { Code = result.ErrorCode });

        return Ok();
    }

    [HttpPut("{schoolID}/visibility")]
    [Authorize(Roles = "Administrator,SchoolManager")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ChangeSchoolVisibility(
        int schoolID,
        [FromBody] ChangeSchoolStateRequest request
    )
    {
        var school = await service.GetSchoolByID(schoolID);

        if (school == null)
            return NotFound(
                new APIError<ChangeSchoolStateErrors>
                {
                    Code = ChangeSchoolStateErrors.SchoolNotFound,
                }
            );

        var userID = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await userService.GetUserByEmailAsync(userID ?? "");

        var ownsSchool = school.Owner.Id == userID;
        var isAdmin = await userService.HasRole(user!, UserRole.Administrator);

        if (!ownsSchool && !isAdmin)
            return Unauthorized(
                new APIError<ChangeSchoolStateErrors>
                {
                    Code = ChangeSchoolStateErrors.AccessDenied,
                }
            );

        var result = await service.SetSchoolVisibility(school, request.State);

        if (!result.IsSuccess)
            return BadRequest(new APIError<ChangeSchoolStateErrors> { Code = result.ErrorCode });

        return Ok();
    }

    [HttpPut("{schoolID}/blockade")]
    [Authorize(Roles = "Administrator")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ChangeSchoolBlockade(
        int schoolID,
        [FromBody] ChangeSchoolStateRequest request
    )
    {
        var school = await service.GetSchoolByID(schoolID);

        if (school == null)
            return NotFound(
                new APIError<ChangeSchoolStateErrors>
                {
                    Code = ChangeSchoolStateErrors.SchoolNotFound,
                }
            );

        var userID = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await userService.GetUserByEmailAsync(userID ?? "");

        if (!await userService.HasRole(user!, UserRole.Administrator))
            return Unauthorized(
                new APIError<ChangeSchoolStateErrors>
                {
                    Code = ChangeSchoolStateErrors.AccessDenied,
                }
            );

        var result = await service.SetSchoolBlockade(school, request.State);

        if (!result.IsSuccess)
            return BadRequest(new APIError<ChangeSchoolStateErrors> { Code = result.ErrorCode });

        return Ok();
    }
}
