using System.Transactions;
using Microsoft.EntityFrameworkCore;
using WheeluAPI.DTO.Errors;
using WheeluAPI.DTO.Schedule;
using WheeluAPI.helpers;
using WheeluAPI.models;
using WheeluAPI.Models;
using WheeluAPI.Models.Vehicle;

namespace WheeluAPI.Services;

public class ScheduleService(ApplicationDbContext dbContext) : BaseService
{
    public ValueTask<RideSlot?> GetSlotByIdAsync(int slotID)
    {
        return dbContext.RideSlots.FindAsync(slotID);
    }

    public Task<List<RideSlot>> GetInstructorSlotsAsync(
        SchoolInstructor instructor,
        GetScheduleSlotsRequest? request = null
    )
    {
        var query = PrepareQuery().Where(s => s.Instructor.Id == instructor.Id);

        if (request?.After != null)
            query = query.Where(s => s.StartTime > request.After);

        if (request?.Before != null)
            query = query.Where(s => s.EndTime < request.Before);

        return query.ToListAsync();
    }

    public IQueryable<RideSlot> PrepareQuery()
    {
        return dbContext.RideSlots.AsQueryable();
    }

    public async Task<bool> WouldRideOverlapAsync(
        SchoolInstructor instructor,
        DateTime startTime,
        DateTime endTime
    )
    {
        var overlappingRides = PrepareQuery()
            .Where(r =>
                r.Instructor == instructor && r.StartTime < endTime && r.EndTime > startTime
            );

        return await overlappingRides.AnyAsync();
    }

    public async Task<bool> WouldRideOverlapAsync(RideSlot slot)
    {
        var overlappingRides = PrepareQuery()
            .Where(r =>
                r.Instructor == slot.Instructor
                && r.StartTime < slot.EndTime
                && r.EndTime > slot.StartTime
                && r.Id != slot.Id
            );

        return await overlappingRides.AnyAsync();
    }

    public async Task<ServiceActionWithDataResult<NewScheduleSlotErrors, RideSlot>> CreateSlot(
        SchoolInstructor instructor,
        DateTime startTime,
        DateTime endTime
    )
    {
        var result = new ServiceActionWithDataResult<NewScheduleSlotErrors, RideSlot>();

        if (startTime == endTime)
        {
            result.ErrorCode = NewScheduleSlotErrors.InvalidDuration;
            return result;
        }

        if (startTime > endTime)
            (startTime, endTime) = (endTime, startTime);

        if (startTime < DateTime.UtcNow)
        {
            result.ErrorCode = NewScheduleSlotErrors.InvalidSlotPlacement;
            result.Details = ["Refusing to place slot in the past."];
            return result;
        }

        using (var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
        {
            var overlap = await WouldRideOverlapAsync(instructor, startTime, endTime);

            if (overlap)
            {
                result.ErrorCode = NewScheduleSlotErrors.SlotOverlap;
                return result;
            }

            var slot = new RideSlot
            {
                Instructor = instructor,
                StartTime = startTime,
                EndTime = endTime,
            };

            dbContext.RideSlots.Add(slot);

            if (await dbContext.SaveChangesAsync() == 0)
            {
                result.ErrorCode = NewScheduleSlotErrors.DBError;
                return result;
            }
            scope.Complete();
            result.IsSuccess = true;
            result.Data = slot;
        }

        return result;
    }

    public async Task<ServiceActionResult<UpdateScheduleSlotErrors>> UpdateSlot(RideSlot slot)
    {
        var result = new ServiceActionResult<UpdateScheduleSlotErrors>();

        if (slot.Ride != null)
        {
            result.ErrorCode = UpdateScheduleSlotErrors.RideAssigned;
            return result;
        }

        if (slot.StartTime == slot.EndTime)
        {
            result.ErrorCode = UpdateScheduleSlotErrors.InvalidDuration;
            return result;
        }

        if (slot.StartTime > slot.EndTime)
            (slot.StartTime, slot.EndTime) = (slot.EndTime, slot.StartTime);

        if (slot.StartTime < DateTime.UtcNow)
        {
            result.ErrorCode = UpdateScheduleSlotErrors.InvalidSlotPlacement;
            result.Details = ["Refusing to place slot in the past."];
            return result;
        }

        using (var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
        {
            var overlap = await WouldRideOverlapAsync(slot);

            if (overlap)
            {
                result.ErrorCode = UpdateScheduleSlotErrors.SlotOverlap;
                return result;
            }

            dbContext.RideSlots.Update(slot);

            if (await dbContext.SaveChangesAsync() == 0)
            {
                result.ErrorCode = UpdateScheduleSlotErrors.DBError;
                return result;
            }

            scope.Complete();
        }

        result.IsSuccess = true;
        return result;
    }

    public async Task<ServiceActionResult<DeleteScheduleSlotErrors>> DeleteSlot(RideSlot slot)
    {
        var result = new ServiceActionResult<DeleteScheduleSlotErrors>();
        if (slot.Ride != null)
        {
            result.ErrorCode = DeleteScheduleSlotErrors.RideAssigned;
            return result;
        }

        dbContext.RideSlots.Remove(slot);

        if (await dbContext.SaveChangesAsync() == 0)
        {
            result.ErrorCode = DeleteScheduleSlotErrors.DBError;
            return result;
        }

        result.IsSuccess = true;
        return result;
    }

    public bool CheckVehicleAvailability(Vehicle vehicle, DateTime startTime, DateTime endTime)
    {
        var rides = vehicle.Rides.Where(r => r.StartTime < endTime && r.EndTime > startTime);

        return !rides.Any();
    }

    public async Task<ServiceActionWithDataResult<CreateRideErrors, Ride>> CreateRide(
        RideSlot slot,
        Course course,
        Vehicle vehicle
    )
    {
        var result = new ServiceActionWithDataResult<CreateRideErrors, Ride>();

        if (slot.Ride != null)
        {
            result.ErrorCode = CreateRideErrors.RideAssigned;
            return result;
        }

        if (!vehicle.AllowedIn.Contains(course.Category))
        {
            result.ErrorCode = CreateRideErrors.VehicleUnavailable;
            result.Details = ["Vehicle is not meant for that course category."];
        }

        using (var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
        {
            if (!CheckVehicleAvailability(vehicle, slot.StartTime, slot.EndTime))
            {
                result.ErrorCode = CreateRideErrors.VehicleUnavailable;
                result.Details = ["Vehicle is busy at that time."];
                return result;
            }

            var ride = new Ride
            {
                Status = RideStatus.Planned,
                Slot = slot,
                Course = course,
                Student = course.Student,
                Instructor = course.Instructor,
                Vehicle = vehicle,
            };

            dbContext.Rides.Add(ride);

            if (await dbContext.SaveChangesAsync() == 0)
            {
                result.ErrorCode = CreateRideErrors.DBError;
                return result;
            }

            scope.Complete();

            result.IsSuccess = true;
            result.Data = ride;
        }

        return result;
    }

    public async Task<ServiceActionResult<ChangeRideVehicleErrors>> ChangeRideVehicle(
        Ride ride,
        Vehicle vehicle
    )
    {
        var result = new ServiceActionResult<ChangeRideVehicleErrors>();

        if (!vehicle.AllowedIn.Contains(ride.Course.Category))
        {
            result.ErrorCode = ChangeRideVehicleErrors.VehicleUnavailable;
            result.Details = ["Vehicle is not meant for that course category."];
        }

        using (var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
        {
            if (!CheckVehicleAvailability(vehicle, ride.Slot.StartTime, ride.Slot.EndTime))
            {
                result.ErrorCode = ChangeRideVehicleErrors.VehicleUnavailable;
                result.Details = ["Vehicle is busy at that time."];
                return result;
            }

            ride.Vehicle = vehicle;

            dbContext.Rides.Update(ride);

            if (await dbContext.SaveChangesAsync() == 0)
            {
                result.ErrorCode = ChangeRideVehicleErrors.DBError;
                return result;
            }

            scope.Complete();

            result.IsSuccess = true;
        }

        return result;
    }

    public async Task<ServiceActionResult<ChangeRideStateErrors>> StartRide(Ride ride)
    {
        var result = new ServiceActionResult<ChangeRideStateErrors>();

        if (ride.Status != RideStatus.Planned)
        {
            result.ErrorCode = ChangeRideStateErrors.InvalidRideStatus;
            return result;
        }

        ride.StartTime = DateTime.UtcNow;
        ride.Status = RideStatus.Ongoing;

        dbContext.Rides.Update(ride);

        if (await dbContext.SaveChangesAsync() == 0)
        {
            result.ErrorCode = ChangeRideStateErrors.DBError;
            return result;
        }

        result.IsSuccess = true;

        return result;
    }

    public async Task<ServiceActionResult<ChangeRideStateErrors>> EndRide(Ride ride)
    {
        var result = new ServiceActionResult<ChangeRideStateErrors>();

        if (ride.Status != RideStatus.Ongoing)
        {
            result.ErrorCode = ChangeRideStateErrors.InvalidRideStatus;
            return result;
        }

        ride.EndTime = DateTime.UtcNow;
        ride.Status = RideStatus.Finished;

        dbContext.Rides.Update(ride);

        if (await dbContext.SaveChangesAsync() == 0)
        {
            result.ErrorCode = ChangeRideStateErrors.DBError;
            return result;
        }

        result.IsSuccess = true;

        return result;
    }

    public async Task<ServiceActionResult<ChangeRideStateErrors>> CancelRide(
        Ride ride,
        User requestor
    )
    {
        var result = new ServiceActionResult<ChangeRideStateErrors>();

        if (ride.Status != RideStatus.Planned)
        {
            result.ErrorCode = ChangeRideStateErrors.InvalidRideStatus;
            return result;
        }

        var canceledRide = new CanceledRide
        {
            Id = ride.Id,
            Status = RideStatus.Canceled,
            Slot = null,
            Course = ride.Course,
            Student = ride.Student,
            Instructor = ride.Instructor,
            StartTime = ride.Slot.StartTime,
            EndTime = ride.Slot.EndTime,
            Vehicle = ride.Vehicle,
            CanceledBy = requestor,
            CanceledAt = DateTime.UtcNow,
        };

        dbContext.Rides.Remove(ride);
        dbContext.CanceledRides.Add(canceledRide);

        if (await dbContext.SaveChangesAsync() == 0)
        {
            result.ErrorCode = ChangeRideStateErrors.DBError;
            return result;
        }

        result.IsSuccess = true;

        return result;
    }

    public async Task<bool> CancelAllRides(Course course, User requestor)
    {
        var tasks = course
            .Rides.Where(r => r.Status == RideStatus.Planned)
            .Select(r => CancelRide(r, requestor));

        var results = await Task.WhenAll(tasks);

        return results.All(res => res.IsSuccess);
    }
}
