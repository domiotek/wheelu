using WheeluAPI.Models;
using WheeluAPI.Models.Vehicle;

namespace WheeluAPI.DTO.Vehicle;

public class ShortVehicleResponse
{
    public int Id { get; set; }

    public int SchoolId { get; set; }

    public required string Model { get; set; }

    public required int ManufacturingYear { get; set; }

    public required string Plate { get; set; }

    public DateOnly? LastInspection { get; set; }

    public int? Power { get; set; } = null;

    public int? Displacement { get; set; } = null;

    public int? TransmissionSpeedCount { get; set; } = null;

    public TransmissionType? TransmissionType { get; set; } = null;

    public required List<CourseCategoryType> AllowedIn { get; set; } = [];
}

public class VehicleResponse
{
    public int Id { get; set; }

    public int SchoolId { get; set; }

    public required string Model { get; set; }

    public required int ManufacturingYear { get; set; }

    public required string Plate { get; set; }

    public required ImageResponse CoverImage { get; set; }

    public DateOnly? LastInspection { get; set; }

    public int? Mileage { get; set; } = null;

    public DateOnly? MileageUpdateDate { get; set; } = null;

    public int? Power { get; set; } = null;

    public int? Displacement { get; set; } = null;

    public int? TransmissionSpeedCount { get; set; } = null;

    public TransmissionType? TransmissionType { get; set; } = null;

    public required List<VehiclePartUsageResponse> Parts { get; set; } = [];

    public required List<CourseCategoryType> AllowedIn { get; set; } = [];

    public string? Note { get; set; }
}
