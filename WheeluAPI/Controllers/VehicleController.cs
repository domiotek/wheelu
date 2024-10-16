using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WheeluAPI.DTO.Errors;
using WheeluAPI.DTO.Vehicle;
using WheeluAPI.helpers;
using WheeluAPI.Mappers;
using WheeluAPI.Services;

namespace WheeluAPI.Controllers;

[ApiController]
[Route("/api/v1/schools/{schoolID}/vehicles")]
public class VehicleController(
    ISchoolService schoolService,
    IUserService userService,
    VehicleService vehicleService,
    VehicleMapper mapper
) : BaseAPIController
{
    [HttpGet("{vehicleID}")]
    [Authorize]
    [ProducesResponseType(typeof(VehicleResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSpecific(int schoolID, int vehicleID)
    {
        var school = await schoolService.GetSchoolByID(schoolID);

        if (school == null)
        {
            return BadRequest(
                new APIError { Code = APIErrorCode.EntityNotFound, Details = ["School not found."] }
            );
        }

        var vehicle = school.Vehicles.Find(v => v.Id == vehicleID);

        if (vehicle == null)
            return BadRequest(
                new APIError { Code = APIErrorCode.EntityNotFound, Details = ["Vehicle not found"] }
            );

        var dto = mapper.GetDTO(vehicle);

        var userID = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await userService.GetUserByEmailAsync(userID ?? "");

        if (school.Owner.Id != user?.Id && await userService.HasRole(user!, UserRole.Administrator))
            dto.Note = null;

        return Ok(dto);
    }

    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(List<ShortVehicleResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSchoolVehicles(
        int schoolID,
        [FromQuery] DateTime? after,
        [FromQuery] DateTime? before
    )
    {
        var school = await schoolService.GetSchoolByID(schoolID);

        if (school == null)
        {
            return BadRequest(
                new APIError { Code = APIErrorCode.EntityNotFound, Details = ["School not found."] }
            );
        }

        if (after != null && before != null)
            return Ok(
                mapper.MapToShortDTO(
                    schoolService
                        .GetVehiclesAvailbleAt(school, (DateTime)after, (DateTime)before)
                        .ToList()
                )
            );

        return Ok(mapper.MapToShortDTO(school.Vehicles));
    }

    [HttpPost]
    [Authorize(Roles = "SchoolManager")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> PostNew(int schoolID, [FromForm] AddVehicleData request)
    {
        var userID = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await userService.GetUserByEmailAsync(userID ?? "");

        var school = await schoolService.GetSchoolByID(schoolID);

        if (school == null)
            return BadRequest(
                new APIError { Code = APIErrorCode.EntityNotFound, Details = ["School not found"] }
            );

        if (school.Owner.Id != user?.Id)
            return BadRequest(new APIError { Code = APIErrorCode.AccessDenied });

        var result = await vehicleService.AddVehicleAsync(school, request);

        if (!result.IsSuccess)
            return BadRequest(new APIError<AlterVehicleErrors> { Code = result.ErrorCode });

        return StatusCode(201);
    }

    [HttpPut("{vehicleID}")]
    [Authorize(Roles = "SchoolManager")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateExisting(
        int schoolID,
        int vehicleID,
        [FromForm] AddVehicleData request
    )
    {
        var userID = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await userService.GetUserByEmailAsync(userID ?? "");

        var school = await schoolService.GetSchoolByID(schoolID);

        if (school == null)
            return BadRequest(
                new APIError { Code = APIErrorCode.EntityNotFound, Details = ["School not found"] }
            );

        if (school.Owner.Id != user?.Id)
            return BadRequest(new APIError { Code = APIErrorCode.AccessDenied });

        var vehicle = school.Vehicles.Find(v => v.Id == vehicleID);

        if (vehicle == null)
            return BadRequest(
                new APIError { Code = APIErrorCode.EntityNotFound, Details = ["Vehicle not found"] }
            );

        var result = await vehicleService.UpdateVehicleAsync(vehicle, request);

        if (!result.IsSuccess)
            return BadRequest(new APIError<AlterVehicleErrors> { Code = result.ErrorCode });

        return Ok();
    }

    [HttpDelete("{vehicleID}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DeleteExisting(int schoolID, int vehicleID)
    {
        var vehicle = await vehicleService.GetVehicleByIDAsync(vehicleID);

        if (vehicle == null || vehicle.School.Id != schoolID)
            return NotFound();

        var userID = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await userService.GetUserByEmailAsync(userID ?? "");

        if (vehicle.School.Owner.Id != user?.Id)
            return BadRequest(new APIError<APIErrorCode> { Code = APIErrorCode.AccessDenied });

        if (await vehicleService.DeleteVehicleAsync(vehicle))
            return Ok();

        return Problem();
    }
}
