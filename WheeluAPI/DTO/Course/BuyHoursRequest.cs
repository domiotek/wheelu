namespace WheeluAPI.DTO.Course;

public class BuyHoursRequest
{
    public required decimal TotalAmount { get; set; }
    public required int HoursCount { get; set; }
}
