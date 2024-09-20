using WheeluAPI.Models;

namespace WheeluAPI.DTO.Vehicle;

public class UpdateVehicleData
{
    public FormFile? Image { get; set; }

    public List<VehiclePartUpdateData>? Parts { get; set; }

    public List<CourseCategoryType>? AllowedIn { get; set; }

    public VehiclePropsData? Props { get; set; }
}
