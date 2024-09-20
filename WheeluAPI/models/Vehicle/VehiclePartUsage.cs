namespace WheeluAPI.Models.Vehicle;

public class VehiclePartUsage
{
    public int Id { get; set; }

    public virtual required VehiclePartType Part { get; set; }

    public DateOnly? LastCheckDate { get; set; }
}
