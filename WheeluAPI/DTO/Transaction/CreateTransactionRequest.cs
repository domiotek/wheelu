namespace WheeluAPI.DTO.Transaction;

public class CreateTransactionRequest
{
    public required decimal ClientTotalAmount { get; set; }
    public required Models.CourseOffer Offer { get; set; }
    public required models.User Payer { get; set; }

    public required Models.Course Course { get; set; }
}
