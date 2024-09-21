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

    public ShortVehicleResponse GetShortDTO(Vehicle source)
    {
        var worstPart = source.Parts.MinBy(p =>
        {
            if (p.LastCheckDate == null)
                return 0;
            var diff =
                DateOnly.FromDateTime(DateTime.UtcNow).DayNumber
                - ((DateOnly)p.LastCheckDate).DayNumber;

            return p.Part.LifespanInDays - diff;
        });

        return new ShortVehicleResponse
        {
            Id = source.Id,
            SchoolId = source.School.Id,
            Model = source.Model,
            ManufacturingYear = source.ManufacturingYear,
            Plate = source.Plate,
            LastInspection = source.LastInspection,
            Power = source.Power,
            Displacement = source.Displacement,
            TransmissionSpeedCount = source.TransmissionSpeedCount,
            TransmissionType = source.TransmissionType,
            AllowedIn = source.AllowedIn,
            WorstPart = worstPart != null ? GetPartDTO(worstPart) : null,
        };
    }

    public List<ShortVehicleResponse> MapToShortDTO(List<Vehicle> vehicles)
    {
        return vehicles.Select(GetShortDTO).ToList();
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
