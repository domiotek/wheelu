using System.ComponentModel.DataAnnotations;
using WheeluAPI.models;

namespace WheeluAPI.Models.Vehicle;

public class Vehicle
{
    public int Id { get; set; }

    public virtual required School School { get; set; }

    public required string Model { get; set; }

    public required int ManufacturingYear { get; set; }

    public required string Plate { get; set; }

    public virtual required Image CoverImage { get; set; }

    public DateOnly? LastInspection { get; set; }

    public int? Mileage { get; set; } = null;

    public DateOnly? MileageUpdateDate { get; set; } = null;

    public int? Power { get; set; } = null;

    public int? Displacement { get; set; } = null;

    public int? TransmissionSpeedCount { get; set; } = null;

    public TransmissionType? TransmissionType { get; set; } = null;

    public virtual required List<VehiclePartUsage> Parts { get; set; } = [];

    public required List<CourseCategoryType> AllowedIn { get; set; } = [];

    [MaxLength(255)]
    public String? Note { get; set; }
}
