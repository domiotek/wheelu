using WheeluAPI.Models;

namespace WheeluAPI.DTO.Transaction;

public class CreateTransactionRequest
{
    public required string Description { get; set; }
    public required decimal ClientTotalAmount { get; set; }
    public required List<TransactionItem> Items { get; set; }
    public required models.User Payer { get; set; }

    public required Models.Course Course { get; set; }
}
