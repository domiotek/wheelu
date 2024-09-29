namespace WheeluAPI.Models;

public enum TransactionItemType
{
    Course,
    Service,
    AdditionalHour,
}

public class TransactionItem
{
    public int Id { get; set; }

    public required TransactionItemType Type { get; set; }

    public required string Name { get; set; }

    public required int Quantity { get; set; }

    public required decimal Total { get; set; }

    public int? RelatedId { get; set; }
}
