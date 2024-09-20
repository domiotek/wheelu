using WheeluAPI.Models;

namespace WheeluAPI.DTO.Vehicle;

public class AddVehicleData : VehiclePropsData
{
    public required FormFile Image { get; set; }

    public required List<VehiclePartUpdateData> Parts { get; set; }

    public required List<CourseCategoryType> AllowedIn { get; set; }
}
