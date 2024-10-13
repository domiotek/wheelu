namespace WheeluAPI.DTO.Schedule;

public class GetScheduleSlotsRequest
{
    public DateTime? Before { get; set; }

    public DateTime? After { get; set; }
}
