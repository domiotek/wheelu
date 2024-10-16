namespace WheeluAPI.DTO.Schedule;

public class NewRideRequest
{
    public required int SlotID { get; set; }

    public required int VehicleID { get; set; }
}
