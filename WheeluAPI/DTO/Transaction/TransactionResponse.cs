using WheeluAPI.DTO.Course;
using WheeluAPI.DTO.User;

namespace WheeluAPI.DTO.Transaction;

public class ShortTransactionDTO
{
    public required string Id { get; set; }

    public required string State { get; set; }

    public required int ItemCount { get; set; }

    public ShortCourseResponse? Course { get; set; }

    public required int SchoolId { get; set; }

    public required ShortUserResponse User { get; set; }

    public required decimal TotalAmount { get; set; }

    public required DateTime Registered { get; set; }

    public required DateTime? Completed { get; set; }

    public required DateTime LastUpdate { get; set; }

    public required string TPayTransactionId { get; set; }
}

public class TransactionDTO : ShortTransactionDTO
{
    public required string TPayPaymentUrl { get; set; }

    public required List<TransactionItemDTO> Items { get; set; }
}

public class TransactionItemDTO
{
    public required int Id { get; set; }

    public required string Type { get; set; }

    public required string Name { get; set; }

    public required int Quantity { get; set; }

    public required decimal Total { get; set; }

    public int? RelatedId { get; set; }
}
