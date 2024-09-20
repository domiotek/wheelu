using System.ComponentModel.DataAnnotations;

namespace WheeluAPI.Models.Vehicle;

public enum VehiclePartTypeId
{
    Tires,
    Brakes,
    Clutch,
    Igniters,
    Suspension,
    Oil,
    Battery,
    Ligths,
}

public class VehiclePartType
{
    [Key]
    public VehiclePartTypeId Id { get; set; }

    public required int LifespanInDays { get; set; }
}
