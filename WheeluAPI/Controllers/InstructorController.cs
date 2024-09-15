using System.Transactions;
using Microsoft.AspNetCore.Mvc;
using WheeluAPI.DTO;
using WheeluAPI.DTO.Errors;
using WheeluAPI.DTO.Instructor;
using WheeluAPI.helpers;
using WheeluAPI.Services;

namespace WheeluAPI.Controllers;

[ApiController]
[Route("/api/v1/instructors")]
public class InstructorController(
    IUserService userService,
    IInstructorService service,
    ISchoolInstructorService instructorService,
    IInstructorInviteService inviteService
) : BaseAPIController
{
    [HttpPost]
    public async Task<IActionResult> CreateInstructorAccount(
        [FromBody] RegisterInstructorRequest request
    )
    {
        var errorResponse = new APIError<InstructorRegisterErrors>
        {
            Code = InstructorRegisterErrors.DbError,
        };

        var token = await inviteService.GetInviteTokenAsync(request.Token);

        if (token == null)
        {
            errorResponse.Code = InstructorRegisterErrors.InvalidToken;
            return BadRequest(errorResponse);
        }

        using (var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
        {
            var result = await userService.CreateAccountAsync(request, UserRole.Instructor, true);

            if (!result.IsSuccess)
            {
                errorResponse.Code = InstructorRegisterErrors.AccountCreationError;
                errorResponse.Details = [result.ErrorCode.ToString(), .. result.Details];
                return BadRequest(errorResponse);
            }

            var profile = await service.CreateProfileAsync(result.User!);

            if (profile == null)
                return BadRequest(errorResponse);

            var attachResult = await instructorService.AttachInstructorAsync(
                token.TargetSchool,
                profile
            );

            if (!attachResult.IsSuccess)
            {
                errorResponse.Code = InstructorRegisterErrors.JoinSchoolError;
                errorResponse.Details =
                [
                    attachResult.ErrorCode.ToString(),
                    .. attachResult.Details,
                ];
                return BadRequest(errorResponse);
            }

            await inviteService.CancelInviteAsync(token);

            scope.Complete();
        }

        return Ok();
    }

    [HttpPost("join")]
    public async Task<IActionResult> AttachInstructorAccount([FromBody] TokenActionRequest request)
    {
        var errorResponse = new APIError<InstructorJoinErrors>
        {
            Code = InstructorJoinErrors.DbError,
        };

        var token = await inviteService.GetInviteTokenAsync(request.Token);

        if (token == null)
        {
            errorResponse.Code = InstructorJoinErrors.InvalidToken;
            return BadRequest(errorResponse);
        }

        using (var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
        {
            var user = await userService.GetUserByEmailAsync(token.Email);

            if (user == null)
            {
                errorResponse.Code = InstructorJoinErrors.UserNotFound;
                return BadRequest(errorResponse);
            }

            var profile = await service.GetFromUserAsync(user);

            if (profile == null)
                return BadRequest(errorResponse);

            var attachResult = await instructorService.AttachInstructorAsync(
                token.TargetSchool,
                profile
            );

            if (!attachResult.IsSuccess)
            {
                errorResponse.Code = InstructorJoinErrors.JoinSchoolError;
                errorResponse.Details =
                [
                    attachResult.ErrorCode.ToString(),
                    .. attachResult.Details,
                ];
                return BadRequest(errorResponse);
            }

            await inviteService.CancelInviteAsync(token);

            scope.Complete();
        }

        return Ok();
    }
}
