using Microsoft.EntityFrameworkCore;
using WheeluAPI.DTO.Errors;
using WheeluAPI.DTO.Image;
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

        var placeholderImage =
            await imageService.GetImage(1)
            ?? new Image
            {
                Id = 0,
                FileName = "",
                UploadDate = DateTime.UtcNow,
            };

        SaveImageResult? imageSaveResult = null;

        if (requestData.Image != null)
        {
            imageSaveResult = await imageService.SaveImage(requestData.Image);

            if (!imageSaveResult.IsSuccess)
            {
                result.ErrorCode = AlterVehicleErrors.InvalidImage;
                result.Details = [imageSaveResult.ErrorCode.ToString()];

                return result;
            }
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
                        .Parts?.Find(p =>
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
            CoverImage = imageSaveResult?.Image ?? placeholderImage,
            LastInspection = requestData.LastInspection,
            Mileage = requestData.Mileage,
            Power = requestData.Power,
            Displacement = requestData.Displacement,
            TransmissionSpeedCount = requestData.TransmissionSpeedCount,
            TransmissionType = requestData.TransmissionType,
            Parts = parts,
            AllowedIn = requestData.AllowedIn ?? [],
            Rides = [],
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
        AddVehicleData requestData
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

        requestData.AllowedIn ??= [];

        for (var i = 0; i < vehicle.AllowedIn.Count; i++)
        {
            var category = vehicle.AllowedIn[i];

            if (requestData.AllowedIn.Contains(category))
                requestData.AllowedIn.Remove(category);
            else
            {
                vehicle.AllowedIn.Remove(category);
                i--;
            }
        }

        foreach (var categoryID in requestData.AllowedIn)
        {
            vehicle.AllowedIn.Add(categoryID);
        }

        if (requestData.Parts != null)
        {
            foreach (var part in requestData.Parts)
            {
                var partDef = vehicle.Parts.Find(p =>
                    p.Part.Id == (VehiclePartTypeId)part.PartType
                );
                if (partDef != null)
                    partDef.LastCheckDate = part.LastCheckDate;
            }
        }

        vehicle.Model = requestData.Model;
        vehicle.ManufacturingYear = requestData.ManufacturingYear;
        vehicle.Plate = requestData.Plate;
        vehicle.LastInspection = requestData.LastInspection;
        vehicle.Mileage = requestData.Mileage;
        vehicle.MileageUpdateDate = requestData.MileageUpdateDate;
        vehicle.Power = requestData.Power;
        vehicle.Displacement = requestData.Displacement;
        vehicle.TransmissionSpeedCount = requestData.TransmissionSpeedCount;
        vehicle.TransmissionType = requestData.TransmissionType;

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

        foreach (var part in vehicle.Parts)
        {
            dbContext.Remove(part);
        }

        dbContext.Remove(vehicle);

        if (await dbContext.SaveChangesAsync() == 0)
            return false;

        return true;
    }
}
