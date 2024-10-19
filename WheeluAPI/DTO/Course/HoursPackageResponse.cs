namespace WheeluAPI.DTO.Course;

public class HoursPackageResponse
{
    public int Id { get; set; }

    public required ShortCourseResponse Course { get; set; }

    public Guid? TransactionID { get; set; }

    public string? Status { get; set; }

    public required decimal TotalPaymentAmount { get; set; }

    public required int HoursCount { get; set; }

    public required DateTime Created { get; set; }
}
