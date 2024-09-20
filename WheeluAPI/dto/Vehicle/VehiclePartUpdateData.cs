namespace WheeluAPI.DTO.Vehicle;

public class VehiclePartUpdateData
{
    public required int PartType { get; set; }

    public required DateOnly LastCheckDate { get; set; }
}
