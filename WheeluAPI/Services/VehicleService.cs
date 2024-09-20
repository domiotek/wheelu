using Microsoft.EntityFrameworkCore;
using WheeluAPI.DTO.Errors;
using WheeluAPI.DTO.Vehicle;
using WheeluAPI.helpers;
using WheeluAPI.models;
using WheeluAPI.Models.Vehicle;

namespace WheeluAPI.Services;

public class VehicleService(ApplicationDbContext dbContext, IImageService imageService)
{
    public ValueTask<Vehicle?> GetVehicleByIDAsync(int id)
    {
        return dbContext.Vehicles.FindAsync(id);
    }

    public async Task<ServiceActionWithDataResult<AlterVehicleErrors, Vehicle>> AddVehicleAsync(
        School school,
        AddVehicleData requestData
    )
    {
        var result = new ServiceActionWithDataResult<AlterVehicleErrors, Vehicle>();

        var imageSaveResult = await imageService.SaveImage(requestData.Image);

        if (!imageSaveResult.IsSuccess)
        {
            result.ErrorCode = AlterVehicleErrors.InvalidImage;
            result.Details = [imageSaveResult.ErrorCode.ToString()];

            return result;
        }

        var partTypes = await dbContext.VehiclePartTypes.ToListAsync();
        var parts = new List<VehiclePartUsage>();

        foreach (var part in partTypes)
        {
            parts.Add(
                new VehiclePartUsage
                {
                    Part = part,
                    LastCheckDate = requestData
                        .Parts.Find(p =>
                            Enum.IsDefined(typeof(VehiclePartTypeId), p.PartType)
                            && (VehiclePartTypeId)p.PartType == part.Id
                        )
                        ?.LastCheckDate,
                }
            );
        }

        var vehicle = new Vehicle
        {
            School = school,
            Model = requestData.Model,
            Plate = requestData.Plate,
            ManufacturingYear = requestData.ManufacturingYear,
            CoverImage = imageSaveResult.Image!,
            LastInspection = requestData.LastInspection,
            Mileage = requestData.Mileage,
            Power = requestData.Power,
            Displacement = requestData.Displacement,
            TransmissionSpeedCount = requestData.TransmissionSpeedCount,
            TransmissionType = requestData.TransmissionType,
            Parts = parts,
            AllowedIn = requestData.AllowedIn,
        };

        dbContext.Add(vehicle);

        if (await dbContext.SaveChangesAsync() == 0)
        {
            result.ErrorCode = AlterVehicleErrors.DbError;
            return result;
        }

        result.IsSuccess = true;
        result.Data = vehicle;
        return result;
    }

    public async Task<ServiceActionResult<AlterVehicleErrors>> UpdateVehicleAsync(
        Vehicle vehicle,
        UpdateVehicleData requestData
    )
    {
        var result = new ServiceActionResult<AlterVehicleErrors>();

        if (requestData.Image != null)
        {
            var imageSaveResult = await imageService.SaveImage(requestData.Image);

            if (!imageSaveResult.IsSuccess)
            {
                result.ErrorCode = AlterVehicleErrors.InvalidImage;
                result.Details = [.. imageSaveResult.Details];

                return result;
            }

            if (vehicle.CoverImage.Id != 1)
            {
                imageService.DeleteImage(vehicle.CoverImage.FileName);
                dbContext.Images.Remove(vehicle.CoverImage);
            }

            vehicle.CoverImage = imageSaveResult.Image!;
        }

        if (requestData.AllowedIn != null)
        {
            vehicle.AllowedIn = requestData.AllowedIn;
        }

        if (requestData.Parts != null)
        {
            foreach (var part in requestData.Parts)
            {
                var partDef = vehicle.Parts.Find(p => p.Id == part.PartType);
                if (partDef != null)
                    partDef.LastCheckDate = part.LastCheckDate;
            }
        }

        if (requestData.Props != null)
        {
            vehicle.Model = requestData.Props.Model;
            vehicle.ManufacturingYear = requestData.Props.ManufacturingYear;
            vehicle.Plate = requestData.Props.Plate;
            vehicle.LastInspection = requestData.Props.LastInspection;
            vehicle.Mileage = requestData.Props.Mileage;
            vehicle.MileageUpdateDate = requestData.Props.MileageUpdateDate;
            vehicle.Power = requestData.Props.Power;
            vehicle.Displacement = requestData.Props.Displacement;
            vehicle.TransmissionSpeedCount = requestData.Props.TransmissionSpeedCount;
            vehicle.TransmissionType = requestData.Props.TransmissionType;
        }

        dbContext.Update(vehicle);

        if (await dbContext.SaveChangesAsync() == 0)
        {
            result.ErrorCode = AlterVehicleErrors.DbError;
            return result;
        }

        result.IsSuccess = true;
        return result;
    }

    public async Task<bool> DeleteVehicleAsync(Vehicle vehicle)
    {
        if (vehicle.CoverImage.Id != 1)
        {
            imageService.DeleteImage(vehicle.CoverImage.FileName);
            dbContext.Images.Remove(vehicle.CoverImage);
        }

        dbContext.Remove(vehicle);

        if (await dbContext.SaveChangesAsync() == 0)
            return false;

        return true;
    }
}
