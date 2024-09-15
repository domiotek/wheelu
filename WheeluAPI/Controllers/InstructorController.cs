using System.Transactions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
    [Authorize(Roles = "SchoolManager,Administrator")]
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

            scope.Complete();
        }

        return Ok();
    }

    [HttpPost("join")]
    [Authorize(Roles = "SchoolManager,Administrator")]
    public async Task<IActionResult> AttachInstructorAccount(
        [FromBody] RegisterInstructorRequest request
    )
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
                return BadRequest(errorResponse);

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

            scope.Complete();
        }

        return Ok();
    }
}
