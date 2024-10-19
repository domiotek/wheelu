using Hangfire;
using Microsoft.EntityFrameworkCore;
using WheeluAPI.DTO.Errors;
using WheeluAPI.DTO.TPay;
using WheeluAPI.DTO.Transaction;
using WheeluAPI.helpers;
using WheeluAPI.Mail.Templates;
using WheeluAPI.Models;

namespace WheeluAPI.Services;

public class TransactionService(
    ApplicationDbContext dbContext,
    TPayService payService,
    IMailService mailService,
    IBackgroundJobClient backgroundJobs,
    ILogger<TransactionService> logger
) : BaseService
{
    public ValueTask<Transaction?> GetTransactionByInternalIdAsync(Guid guid)
    {
        return dbContext.Transactions.FindAsync(guid);
    }

    public Task<Transaction?> GetTransactionByTPayIdAsync(string id)
    {
        return dbContext.Transactions.Where(t => t.TPayTransactionID == id).SingleOrDefaultAsync();
    }

    public Task<Transaction?> GetTransactionByTPayTitleAsync(string title)
    {
        return dbContext
            .Transactions.Where(t => t.TPayTransactionTitle == title)
            .SingleOrDefaultAsync();
    }

    public Task<List<Transaction>> GetTransactionsAsync()
    {
        return dbContext.Transactions.ToListAsync();
    }

    public IQueryable<Transaction> PrepareQuery()
    {
        return dbContext.Transactions.AsQueryable();
    }

    public IQueryable<Transaction> GetPageAsync(
        PagingMetadata meta,
        out int appliedPageSize,
        IQueryable<Transaction>? queryable = null
    )
    {
        var results = ApplyPaging(
            queryable ?? dbContext.Transactions.AsQueryable(),
            meta,
            out int actualPageSize
        );

        appliedPageSize = actualPageSize;

        return results;
    }

    public Task<int> CountAsync()
    {
        return dbContext.Transactions.CountAsync();
    }

    public void CancelTransactionTask(Guid tid)
    {
        var transaction = dbContext.Transactions.Find(tid);

        if (transaction == null)
            return;

        if (transaction.State == TransactionState.Registered)
        {
            var result = CancelTransaction(transaction).GetAwaiter().GetResult();

            if (result == false)
            {
                logger.LogError("Couldn't cancel transaction #{tid}", transaction.Id);
                return;
            }

            SendCanceledTransactionEmail(transaction).GetAwaiter();
        }
    }

    public async Task<bool> SendCanceledTransactionEmail(Transaction transaction)
    {
        var template = mailService.GetTemplate<PaymentCanceledTemplateVariables>(
            "payment-canceled"
        );

        if (template == null)
            return false;

        var templateData = new PaymentCanceledTemplateVariables
        {
            FirstName = transaction.User.Name,
            TransactionId = transaction.TPayTransactionTitle,
        };

        if (
            await mailService.SendEmail(
                "payments",
                template.Populate(templateData),
                [transaction.User.Email]
            ) == false
        )
            return false;

        return true;
    }

    public async Task<bool> SendCompletedTransactionEmail(Transaction transaction)
    {
        var template = mailService.GetTemplate<PaymentCompletedTemplateVariables>(
            "payment-completed"
        );

        if (template == null)
            return false;

        var templateData = new PaymentCompletedTemplateVariables
        {
            FirstName = transaction.User.Name,
            TransactionId = transaction.TPayTransactionTitle,
            SchoolName = transaction.School.Name,
            CategoryName = transaction.Course?.Category.ToString() ?? "",
        };

        if (
            await mailService.SendEmail(
                "payments",
                template.Populate(templateData),
                [transaction.User.Email]
            ) == false
        )
            return false;

        return true;
    }

    public async Task<bool> SendRefundedTransactionEmail(Transaction transaction)
    {
        var template = mailService.GetTemplate<PaymentRefundedTemplateVariables>(
            "payment-refunded"
        );

        if (template == null)
            return false;

        var templateData = new PaymentRefundedTemplateVariables
        {
            FirstName = transaction.User.Name,
            TransactionId = transaction.TPayTransactionTitle,
        };

        if (
            await mailService.SendEmail(
                "payments",
                template.Populate(templateData),
                [transaction.User.Email]
            ) == false
        )
            return false;

        return true;
    }

    public async Task<
        ServiceActionWithDataResult<CreateTransactionErrors, CreateTransactionResponse>
    > CreateTransaction(CreateTransactionRequest requestData)
    {
        var result =
            new ServiceActionWithDataResult<CreateTransactionErrors, CreateTransactionResponse>();

        var calcAmount = requestData.Items.Sum(i => i.Total);

        if (calcAmount != requestData.ClientTotalAmount)
        {
            result.ErrorCode = CreateTransactionErrors.PriceMismatch;
            result.Details =
            [
                "Client provided total price differs from the freshly calculated one.",
            ];
            return result;
        }

        var request = new RegisterTransactionRequest
        {
            Amount = calcAmount,
            Description = requestData.Description,
            SchoolID = requestData.Course.School.Id,
            Payer = new PayerDetails
            {
                Email = requestData.Payer.Email!,
                Name = $"{requestData.Payer.Name} {requestData.Payer.Surname}",
            },
        };

        var tPayResult = await payService.RegisterTransaction(request);

        if (!tPayResult.IsSuccess)
        {
            result.ErrorCode = CreateTransactionErrors.TPayError;
            result.Details = [tPayResult.ErrorCode.ToString(), .. tPayResult.Details];
            return result;
        }

        var transaction = new Transaction
        {
            State = TransactionState.Registered,
            School = requestData.Course.School,
            Course = requestData.Course,
            Items = requestData.Items,
            User = requestData.Payer,
            TotalAmount = requestData.ClientTotalAmount,
            Registered = DateTime.UtcNow,
            Completed = null,
            LastUpdate = DateTime.UtcNow,
            TPayTransactionID = tPayResult.Data!.TransactionId,
            TPayTransactionTitle = tPayResult.Data!.Title,
            TPayPaymentUrl = tPayResult.Data!.TransactionPaymentUrl,
        };

        dbContext.Transactions.Add(transaction);

        if (await dbContext.SaveChangesAsync() == 0)
        {
            result.ErrorCode = CreateTransactionErrors.DbError;
            return result;
        }

        backgroundJobs.Schedule(
            () => CancelTransactionTask(transaction.Id),
            TimeSpan.FromMinutes(7)
        );

        result.IsSuccess = true;
        result.Data = new CreateTransactionResponse
        {
            Transaction = transaction,
            PaymentUrl = tPayResult.Data.TransactionPaymentUrl,
        };

        return result;
    }

    /// <summary>
    /// Also removes related identities
    /// </summary>
    public async Task<bool> CancelTransaction(Transaction transaction)
    {
        transaction.State = TransactionState.Canceled;
        transaction.LastUpdate = DateTime.UtcNow;

        foreach (var item in transaction.Items)
        {
            switch (item.Type)
            {
                case TransactionItemType.Course:
                    dbContext.Courses.Remove(transaction.Course!);
                    transaction.Course = null;
                    break;
                case TransactionItemType.AdditionalHour:
                    var package = await dbContext.HoursPackages.FindAsync(item.RelatedId);
                    if (package != null)
                        dbContext.HoursPackages.Remove(package);
                    break;
            }
        }

        if (transaction.Items.Find(i => i.Type == TransactionItemType.Course) != null) { }

        dbContext.Transactions.Update(transaction);

        return await dbContext.SaveChangesAsync() > 0;
    }

    public async Task<bool> CompleteTransaction(Transaction transaction)
    {
        transaction.State = TransactionState.Complete;
        transaction.Completed = DateTime.UtcNow;
        transaction.LastUpdate = DateTime.UtcNow;

        if (transaction.Items.Find(i => i.Type == TransactionItemType.Course) != null)
        {
            transaction.Course!.TransactionComplete = true;
        }

        dbContext.Transactions.Update(transaction);

        return await dbContext.SaveChangesAsync() > 0;
    }

    public async Task<ServiceActionResult<RefundTransactionErrors>> RefundTransaction(
        Transaction transaction
    )
    {
        var result = new ServiceActionResult<RefundTransactionErrors>();

        var request = new RefundTransactionRequest
        {
            TransactionId = transaction.TPayTransactionID,
            Amount = transaction.TotalAmount,
        };

        var tPayResult = await payService.RefundTransaction(request);

        if (!tPayResult.IsSuccess)
        {
            result.ErrorCode = RefundTransactionErrors.TPayError;
            result.Details = [tPayResult.ErrorCode.ToString(), .. tPayResult.Details];
            return result;
        }

        transaction.State = TransactionState.Refund;
        transaction.LastUpdate = DateTime.UtcNow;

        dbContext.Update(transaction);

        if (await dbContext.SaveChangesAsync() == 0)
        {
            result.ErrorCode = RefundTransactionErrors.DbError;
            return result;
        }

        result.IsSuccess = true;
        return result;
    }
}
