using System.Security.Claims;
using System.Transactions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WheeluAPI.Controllers;
using WheeluAPI.DTO.Errors;
using WheeluAPI.DTO.Schedule;
using WheeluAPI.helpers;
using WheeluAPI.Mappers;
using WheeluAPI.Services;

[ApiController]
[Route("/api/v1/instructors/{instructorID}/schedule")]
public class ScheduleController(
    ScheduleService service,
    IInstructorService instructorService,
    IUserService userService,
    ScheduleMapper mapper
) : BaseAPIController
{
    private async Task<InstructorValidationResult> ValidateAccessAsync(int instructorID)
    {
        var result = new InstructorValidationResult();

        var requestorEmail = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var requestor = await userService.GetUserByEmailAsync(requestorEmail!);

        var instructor = await instructorService.GetByIDAsync(instructorID);

        if (instructor == null)
        {
            result.ActionResult = NotFound(
                new APIError
                {
                    Code = APIErrorCode.EntityNotFound,
                    Details = ["Instructor not found"],
                }
            );

            return result;
        }

        if (instructor.User.Id != requestor!.Id)
        {
            result.ActionResult = BadRequest(new APIError { Code = APIErrorCode.AccessDenied });

            return result;
        }

        if (instructor.ActiveEmployment == null)
        {
            result.ActionResult = BadRequest(
                new APIError<ManageScheduleSlotErrors>
                {
                    Code = ManageScheduleSlotErrors.InstructorNotEmployed,
                }
            );

            return result;
        }

        result.Instructor = instructor;
        result.Requestor = requestor;

        return result;
    }

    [HttpGet]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(APIError), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetSlotsOfInstructor(
        int instructorID,
        [FromQuery] GetScheduleSlotsRequest request
    )
    {
        var instructor = await instructorService.GetByIDAsync(instructorID);

        if (instructor == null)
            return NotFound(
                new APIError
                {
                    Code = APIErrorCode.EntityNotFound,
                    Details = ["Instructor not found"],
                }
            );

        if (instructor.ActiveEmployment == null)
            return BadRequest(
                new APIError<ManageScheduleSlotErrors>
                {
                    Code = ManageScheduleSlotErrors.InstructorNotEmployed,
                }
            );

        return Ok(
            mapper.MapToSlotDTO(
                await service.GetInstructorSlotsAsync(instructor.ActiveEmployment, request)
            )
        );
    }

    [HttpGet("/api/v1/users/{userID}/schedule")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(APIError), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetSlotsOfStudent(
        string userID,
        [FromQuery] GetScheduleSlotsRequest request
    )
    {
        var requestorEmail = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var requestor = await userService.GetUserByEmailAsync(requestorEmail!);
        var isAdmin = await userService.HasRole(requestor!, UserRole.Administrator);

        if (requestor!.Id != userID && !isAdmin)
            return BadRequest(new APIError { Code = APIErrorCode.AccessDenied });

        var targetUser = requestor;

        if (requestor.Id != userID)
            targetUser = await userService.GetUserByIDAsync(userID);

        if (targetUser == null)
            return NotFound(
                new APIError { Code = APIErrorCode.EntityNotFound, Details = ["User not found"] }
            );

        return Ok(mapper.MapToSlotDTO(await service.GetStudentSlotsAsync(targetUser, request)));
    }

    [HttpPost]
    [Authorize(Roles = "Instructor")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(APIError), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> PostSlot(
        int instructorID,
        [FromBody] ManageSlotRequest request
    )
    {
        var validationResult = await ValidateAccessAsync(instructorID);
        if (validationResult.ActionResult != null)
            return validationResult.ActionResult;

        var instructor = validationResult.Instructor!;

        using (var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
        {
            var slotResult = await service.CreateSlot(
                instructor.ActiveEmployment!,
                request.StartTime,
                request.EndTime
            );

            if (!slotResult.IsSuccess)
                return BadRequest(
                    new APIError<NewScheduleSlotErrors>
                    {
                        Code = slotResult.ErrorCode,
                        Details = slotResult.Details,
                    }
                );

            scope.Complete();
        }

        return StatusCode(201);
    }

    [HttpPut("{slotID}")]
    [Authorize(Roles = "Instructor")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(APIError), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> PutSlot(
        int instructorID,
        int slotID,
        [FromBody] ManageSlotRequest request
    )
    {
        var validationResult = await ValidateAccessAsync(instructorID);

        if (validationResult.ActionResult != null)
            return validationResult.ActionResult;

        var slot = await service.GetSlotByIdAsync(slotID);

        if (slot == null)
            return BadRequest(
                new APIError { Code = APIErrorCode.EntityNotFound, Details = ["Slot not found"] }
            );

        slot.StartTime = request.StartTime;
        slot.EndTime = request.EndTime;

        var result = await service.UpdateSlot(slot);

        if (!result.IsSuccess)
            return BadRequest(
                new APIError<UpdateScheduleSlotErrors>
                {
                    Code = result.ErrorCode,
                    Details = result.Details,
                }
            );

        return Ok();
    }

    [HttpDelete("{slotID}")]
    [Authorize(Roles = "Instructor")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(APIError), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(string), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteSlot(int instructorID, int slotID)
    {
        var validationResult = await ValidateAccessAsync(instructorID);

        if (validationResult.ActionResult != null)
            return validationResult.ActionResult;

        var slot = await service.GetSlotByIdAsync(slotID);

        if (slot == null)
            return BadRequest(
                new APIError { Code = APIErrorCode.EntityNotFound, Details = ["Slot not found"] }
            );

        var result = await service.DeleteSlot(slot);

        if (!result.IsSuccess)
            return BadRequest(new APIError<DeleteScheduleSlotErrors> { Code = result.ErrorCode });

        return Ok();
    }
}
