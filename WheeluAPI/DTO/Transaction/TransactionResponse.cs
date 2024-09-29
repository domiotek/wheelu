using WheeluAPI.DTO.Course;

namespace WheeluAPI.DTO.Transaction;

public class ShortTransactionDTO
{
    public required string Id { get; set; }

    public required string State { get; set; }

    public required int ItemCount { get; set; }

    public required ShortCourseResponse Course { get; set; }

    public required decimal TotalAmount { get; set; }

    public required DateTime Registered { get; set; }

    public required DateTime? Completed { get; set; }

    public required DateTime LastUpdate { get; set; }

    public required string TPayTransactionID { get; set; }
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
