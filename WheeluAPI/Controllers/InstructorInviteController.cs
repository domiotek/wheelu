using System.Security.Claims;
using System.Transactions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WheeluAPI.DTO.Errors;
using WheeluAPI.DTO.Instructor;
using WheeluAPI.helpers;
using WheeluAPI.Helpers;
using WheeluAPI.Models;
using WheeluAPI.Services;

namespace WheeluAPI.Controllers;

[ApiController]
[Route("/api/v1/schools/{schoolID}/instructors/invites")]
public class InstructorInviteController(
    ISchoolService schoolService,
    IInstructorInviteService inviteService
) : BaseAPIController
{
    private async Task<TokenResolveResult<InstructorInviteToken>> ResolveToToken(
        int schoolID,
        string tokenID
    )
    {
        var result = new TokenResolveResult<InstructorInviteToken>();

        var school = await schoolService.GetSchoolByID(schoolID);

        if (school == null)
        {
            result.ErrorResult = NotFound(
                new APIError { Code = APIErrorCode.EntityNotFound, Details = ["School not found"] }
            );

            return result;
        }

        var userEmail = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!await schoolService.ValidateSchoolManagementAccess(school, userEmail!))
        {
            result.ErrorResult = BadRequest(new APIError { Code = APIErrorCode.AccessDenied });

            return result;
        }

        var token = await inviteService.GetInviteTokenByIdAsync(tokenID);

        if (token == null)
        {
            result.ErrorResult = NotFound(
                new APIError { Code = APIErrorCode.EntityNotFound, Details = ["Token not found"] }
            );

            return result;
        }

        result.IsSuccess = true;
        result.Token = token;

        return result;
    }

    [HttpGet("/api/v1/instructors/invites/{tokenID}")]
    [ProducesResponseType(typeof(InstructorInviteTokenResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSchoolInvite(string tokenID)
    {
        var token = await inviteService.GetInviteTokenByIdAsync(tokenID);

        if (token == null)
            return NotFound();

        return Ok(inviteService.GetDTO(token));
    }

    [HttpGet]
    [Authorize(Roles = "SchoolManager,Administrator")]
    [ProducesResponseType(typeof(List<InstructorInviteTokenResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSchoolInvites(int schoolID)
    {
        var school = await schoolService.GetSchoolByID(schoolID);

        if (school == null)
            return NotFound();

        var userEmail = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (
            !await schoolService.ValidateSchoolManagementAccess(
                school,
                userEmail!,
                SchoolManagementAccessMode.AllPrivileged
            )
        )
            return BadRequest(new APIError { Code = APIErrorCode.AccessDenied });

        var tokens = await inviteService.GetInviteTokensAsync(school);

        return Ok(inviteService.MapToDTO(tokens));
    }

    [HttpPost("{tokenID}")]
    [Authorize(Roles = "SchoolManager")]
    [ProducesResponseType(typeof(List<SchoolInstructorResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ResendEmail(int schoolID, string tokenID)
    {
        var tokenResult = await ResolveToToken(schoolID, tokenID);

        if (!tokenResult.IsSuccess)
            return tokenResult.ErrorResult!;

        var result = await inviteService.ResendInviteAsync(tokenResult.Token!);

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

    [HttpPut("{tokenID}")]
    [Authorize(Roles = "SchoolManager")]
    [ProducesResponseType(typeof(List<SchoolInstructorResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RenewInvite(int schoolID, string tokenID)
    {
        var tokenResult = await ResolveToToken(schoolID, tokenID);

        if (!tokenResult.IsSuccess)
            return tokenResult.ErrorResult!;

        var result = await inviteService.RenewInviteAsync(tokenResult.Token!);

        if (!result)
            return BadRequest(new APIError { Code = APIErrorCode.DbError });

        return Ok();
    }

    [HttpDelete("{tokenID}")]
    [Authorize(Roles = "SchoolManager")]
    [ProducesResponseType(typeof(List<SchoolInstructorResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CancelInvite(int schoolID, string tokenID)
    {
        var tokenResult = await ResolveToToken(schoolID, tokenID);

        if (!tokenResult.IsSuccess)
            return tokenResult.ErrorResult!;

        var result = await inviteService.CancelInviteAsync(tokenResult.Token!);

        if (!result)
            return BadRequest(new APIError { Code = APIErrorCode.DbError });

        return Ok();
    }
}
