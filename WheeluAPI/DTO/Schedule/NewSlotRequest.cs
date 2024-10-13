namespace WheeluAPI.DTO.Schedule;

public class ManageSlotRequest
{
    public required DateTime StartTime { get; set; }

    public required DateTime EndTime { get; set; }
}
