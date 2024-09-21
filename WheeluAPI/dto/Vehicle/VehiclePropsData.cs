using WheeluAPI.Models.Vehicle;

namespace WheeluAPI.DTO.Vehicle;

public class VehiclePropsData
{
    public required string Model { get; set; }

    public required int ManufacturingYear { get; set; }

    public required string Plate { get; set; }

    public DateOnly? LastInspection { get; set; }

    public int? Mileage { get; set; } = null;

    public DateOnly? MileageUpdateDate { get; set; } = null;

    public int? Power { get; set; } = null;

    public decimal? Displacement { get; set; } = null;

    public int? TransmissionSpeedCount { get; set; } = null;

    public TransmissionType? TransmissionType { get; set; } = null;

    public string? Note { get; set; }
}
