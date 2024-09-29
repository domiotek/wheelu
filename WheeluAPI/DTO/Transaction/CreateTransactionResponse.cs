namespace WheeluAPI.DTO.Transaction;

public class CreateTransactionResponse
{
    public required Models.Transaction Transaction { get; set; }

    public required string PaymentUrl { get; set; }
}
