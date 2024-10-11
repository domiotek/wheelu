using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WheeluAPI.DTO.Errors;
using WheeluAPI.DTO.TPay;
using WheeluAPI.DTO.Transaction;
using WheeluAPI.helpers;
using WheeluAPI.Helpers;
using WheeluAPI.Mappers;
using WheeluAPI.models;
using WheeluAPI.Models;
using WheeluAPI.Services;

namespace WheeluAPI.Controllers;

[ApiController]
[Route("/api/v1/transactions")]
public class TransactionController(
    TransactionService service,
    TransactionMapper mapper,
    ISchoolService schoolService,
    IUserService userService
) : BaseAPIController
{
    [HttpPost("notify")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ReceiveTPayNotification(
        [FromForm] NotificationData notificationData
    )
    {
        string rawBody;
        using (var reader = new StreamReader(Request.Body, Encoding.UTF8, leaveOpen: true))
        {
            rawBody = await reader.ReadToEndAsync();
        }

        var validation = JWSHelper.ValidateRequest(
            Request,
            new JWSHelperValidationParams
            {
                UrlPrefix = "https://secure.sandbox.tpay.com",
                CertUrl = "https://secure.sandbox.tpay.com/x509/tpay-jws-root.pem",
            },
            rawBody
        );

        if (!validation.IsSuccess)
        {
            return BadRequest(new APIError<JWSErrors> { Code = validation.ErrorCode });
        }

        var transaction = await service.GetTransactionByTPayTitleAsync(notificationData.tr_id);

        if (transaction == null)
            return NotFound();

        switch (transaction.State)
        {
            case TransactionState.Registered:
                if (!await service.CompleteTransaction(transaction))
                    return BadRequest("FALSE, retry pls");

                await service.SendCompletedTransactionEmail(transaction);
                break;
            case TransactionState.Canceled:
                if (notificationData.tr_status != "CHARGEBACK")
                {
                    if (!(await service.RefundTransaction(transaction)).IsSuccess)
                    {
                        return BadRequest("FALSE, retry pls");
                    }

                    await service.SendRefundedTransactionEmail(transaction);
                }

                break;
            case TransactionState.Refund:
                return NotFound();
        }

        Response.ContentType = "application/json";
        return Ok("{\"result\": true}");
    }

    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(ShortTransactionDTO), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTransactionsOfTargetAsync(
        [FromQuery] OptionalPagingMetadata pagingMeta,
        [FromQuery] int? schoolID,
        [FromQuery] string? userID
    )
    {
        var query = service.PrepareQuery();

        var userEmail = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var requestor = await userService.GetUserByEmailAsync(userEmail ?? "");

        bool isAdmin = await userService.HasRole(requestor!, UserRole.Administrator);

        School? school = null;

        if (schoolID != null)
        {
            school = await schoolService.GetSchoolByID((int)schoolID);
            if (school == null)
                return NotFound(
                    new APIError
                    {
                        Code = APIErrorCode.EntityNotFound,
                        Details = ["School not found"],
                    }
                );
            if (
                !await schoolService.ValidateSchoolManagementAccess(
                    school,
                    userEmail!,
                    SchoolManagementAccessMode.AllPrivileged
                )
            )
                return BadRequest(new APIError { Code = APIErrorCode.AccessDenied });
        }

        if (userID != null)
        {
            var user = await userService.GetUserByIDAsync(userID);

            if (user == null)
                return NotFound(
                    new APIError
                    {
                        Code = APIErrorCode.EntityNotFound,
                        Details = ["User not found"],
                    }
                );

            if (user.Id != requestor!.Id && !isAdmin)
                return BadRequest(new APIError { Code = APIErrorCode.AccessDenied });
        }

        if (schoolID == null && userID == null && !isAdmin)
            return BadRequest(new APIError { Code = APIErrorCode.AccessDenied });

        if (pagingMeta.PageNumber != null)
        {
            int appliedPageSize;

            PagingMetadata metadata =
                new() { PageNumber = (int)pagingMeta.PageNumber, PageSize = pagingMeta.PageSize };

            if (schoolID != null)
                query.Where(t => t.School.Id == schoolID);

            if (userID != null)
                query.Where(t => t.User.Id == userID);

            var count = await query.CountAsync();

            query = service.GetPageAsync(metadata, out appliedPageSize, query);

            var results = await query.ToListAsync();

            return Paginated(mapper.MapToShortDTO(results), count, appliedPageSize);
        }

        if (schoolID == null && userID == null)
        {
            var allTransactions = await service.GetTransactionsAsync();
            return Paginated(
                mapper.MapToShortDTO(allTransactions),
                allTransactions.Count,
                allTransactions.Count
            );
        }

        if (schoolID != null)
            query = query.Where(t => t.School.Id == schoolID);

        if (userID != null)
            query = query.Where(t => t.User.Id == userID);

        var transactions = await query.ToListAsync();
        return Paginated(
            mapper.MapToShortDTO(transactions),
            transactions.Count,
            transactions.Count
        );
    }

    [HttpGet("{transactionID}")]
    [Authorize]
    [ProducesResponseType(typeof(TransactionDTO), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTransaction(Guid transactionID)
    {
        var transaction = await service.GetTransactionByInternalIdAsync(transactionID);
        if (transaction == null)
            return NotFound();

        var userEmail = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await userService.GetUserByEmailAsync(userEmail ?? "");

        if (
            transaction.User.Id != user!.Id
            && await schoolService.ValidateSchoolManagementAccess(
                transaction.School,
                userEmail!,
                SchoolManagementAccessMode.AllPrivileged
            )
        )
            return BadRequest(new APIError { Code = APIErrorCode.AccessDenied });

        return Ok(mapper.GetDTO(transaction));
    }
}
