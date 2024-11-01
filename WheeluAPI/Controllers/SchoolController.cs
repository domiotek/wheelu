namespace WheeluAPI.Controllers;

using System.Linq.Expressions;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WheeluAPI.DTO;
using WheeluAPI.DTO.Errors;
using WheeluAPI.DTO.School;
using WheeluAPI.helpers;
using WheeluAPI.Mappers;
using WheeluAPI.models;
using WheeluAPI.Services;

[ApiController]
[Route("/api/v1/schools")]
public class SchoolController(
    ISchoolService service,
    SchoolMapper mapper,
    IUserService userService,
    ISchoolService schoolService
) : BaseAPIController
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
        return Ok(mapper.GetDTO(school));
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

            return Paginated(mapper.MapToDTO(results), await service.Count(), appliedPageSize);
        }

        var schools = await service.GetAllSchools();
        return Paginated(mapper.MapToDTO(schools), schools.Count, schools.Count);
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchSchoolsAsync(
        [FromQuery] PagingMetadata pagingMetadata,
        [FromQuery] SchoolSearchRequest requestData
    )
    {
        var query = service.PrepareQuery();

        query = query.Where(s => s.Hidden == false);

        if (requestData.Query != null)
            query = query.Where(x => x.Name.Contains(requestData.Query));

        var sortExpressions = new Dictionary<SortingOptions, Expression<Func<School, object>>>
        {
            { SortingOptions.Name, x => x.Name },
        };

        var sortExpression = sortExpressions.TryGetValue(
            requestData.SortingTarget,
            out Expression<Func<School, object>>? value
        )
            ? value
            : x => x.Id;

        query =
            requestData.SortingType == SortingType.Asc
                ? query.OrderBy(sortExpression)
                : query.OrderByDescending(sortExpression);

        var totalItems = await query.CountAsync();

        int appliedPageSize;

        var results = await service
            .GetPageAsync(pagingMetadata, out appliedPageSize, query)
            .ToListAsync();

        return Paginated(mapper.MapToDTO(results), totalItems, appliedPageSize);
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

        var userEmail = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await userService.GetUserByEmailAsync(userEmail ?? "");

        if (
            !await schoolService.ValidateSchoolManagementAccess(
                school,
                userEmail ?? "",
                Helpers.SchoolManagementAccessMode.AllPrivileged
            )
        )
        {
            return Unauthorized(
                new APIError<UpdateSchoolErrors> { Code = UpdateSchoolErrors.AccessDenied }
            );
        }
        var isAdmin = await userService.HasRole(user!, UserRole.Administrator);

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

        var userEmail = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var hasAccess = await service.ValidateSchoolManagementAccess(
            school,
            userEmail!,
            Helpers.SchoolManagementAccessMode.AllPrivileged
        );

        if (!hasAccess)
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
