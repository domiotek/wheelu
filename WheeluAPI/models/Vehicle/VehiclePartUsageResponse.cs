using WheeluAPI.DTO.Vehicle;

namespace WheeluAPI.Models.Vehicle;

public class VehiclePartUsageResponse
{
    public required VehiclePartTypeResponse Part { get; set; }

    public DateOnly? LastCheckDate { get; set; }
}
