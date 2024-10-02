using System.ComponentModel.DataAnnotations;
using WheeluAPI.models;

namespace WheeluAPI.Models;

public enum TransactionState
{
    Registered,
    Canceled,
    Complete,
    Refund,
}

public class Transaction
{
    [Key]
    public Guid Id { get; set; }

    public required TransactionState State { get; set; }

    public virtual required School School { get; set; }

    public virtual Course? Course { get; set; }

    public virtual required List<TransactionItem> Items { get; set; }

    public virtual required User User { get; set; }

    public required decimal TotalAmount { get; set; }

    public required DateTime Registered { get; set; }

    public required DateTime? Completed { get; set; }

    public required DateTime LastUpdate { get; set; }

    public required string TPayTransactionID { get; set; }

    public required string TPayTransactionTitle { get; set; }

    public required string TPayPaymentUrl { get; set; }
}
