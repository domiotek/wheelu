using WheeluAPI.DTO.Vehicle;
using WheeluAPI.Models.Vehicle;
using WheeluAPI.Services;

namespace WheeluAPI.Mappers;

public class VehicleMapper(IImageService imageService)
{
    public VehiclePartUsageResponse GetPartDTO(VehiclePartUsage source)
    {
        return new VehiclePartUsageResponse
        {
            Part = new VehiclePartTypeResponse
            {
                Id = source.Part.Id,
                LifespanInDays = source.Part.LifespanInDays,
            },
            LastCheckDate = source.LastCheckDate,
        };
    }

    public List<VehiclePartUsageResponse> MapPartsToDTO(List<VehiclePartUsage> source)
    {
        return source.Select(GetPartDTO).ToList();
    }

    public VehicleResponse GetDTO(Vehicle source)
    {
        return new VehicleResponse
        {
            Id = source.Id,
            SchoolId = source.School.Id,
            Model = source.Model,
            ManufacturingYear = source.ManufacturingYear,
            Plate = source.Plate,
            CoverImage = imageService.GetDTO(source.CoverImage),
            LastInspection = source.LastInspection,
            Mileage = source.Mileage,
            MileageUpdateDate = source.MileageUpdateDate,
            Power = source.Power,
            Displacement = source.Displacement,
            TransmissionSpeedCount = source.TransmissionSpeedCount,
            TransmissionType = source.TransmissionType,
            Parts = MapPartsToDTO(source.Parts),
            AllowedIn = source.AllowedIn,
        };
    }

    public List<VehicleResponse> MapToDTO(List<Vehicle> vehicles)
    {
        return vehicles.Select(GetDTO).ToList();
    }
}
