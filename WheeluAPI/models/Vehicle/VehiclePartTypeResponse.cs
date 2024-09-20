using WheeluAPI.Models.Vehicle;

namespace WheeluAPI.DTO.Vehicle;

public class VehiclePartTypeResponse
{
    public VehiclePartTypeId Id { get; set; }

    public required int LifespanInDays { get; set; }
}
