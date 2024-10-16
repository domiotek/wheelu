using WheeluAPI.Models;

namespace WheeluAPI.DTO.Schedule;

public class ChangeRideStateRequest
{
    public required RideStatus NewStatus { get; set; }
}
