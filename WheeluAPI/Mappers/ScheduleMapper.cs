using WheeluAPI.DTO.Schedule;
using WheeluAPI.Models;

namespace WheeluAPI.Mappers;

public class ScheduleMapper(
    SchoolInstructorDTOMapper instructorMapper,
    CourseMapper courseMapper,
    VehicleMapper vehicleMapper
)
{
    public ShortRideSlotResponse GetShortSlotDTO(RideSlot source)
    {
        return new ShortRideSlotResponse
        {
            Id = source.Id,
            Instructor = instructorMapper.GetShortDTO(source.Instructor),
            StartTime = source.StartTime,
            EndTime = source.EndTime,
        };
    }

    public RideSlotResponse GetSlotDTO(RideSlot source)
    {
        return new RideSlotResponse
        {
            Id = source.Id,
            Instructor = instructorMapper.GetShortDTO(source.Instructor),
            StartTime = source.StartTime,
            EndTime = source.EndTime,
            Ride = source.Ride != null ? GetShortRideDTO(source.Ride) : null,
        };
    }

    public ShortRideResponse GetShortRideDTO(Ride source)
    {
        return new ShortRideResponse
        {
            Id = source.Id,
            Status = source.Status,
            StartTime = source.StartTime,
            EndTime = source.EndTime,
            Course = courseMapper.GetShortDTO(source.Course),
            HoursCount = source.HoursCount,
        };
    }

    public ShortRideResponse GetShortRideDTO(CanceledRide source)
    {
        return new ShortRideResponse
        {
            Id = source.Id,
            Status = RideStatus.Canceled,
            StartTime = source.StartTime,
            EndTime = source.EndTime,
            Course = courseMapper.GetShortDTO(source.Course),
            HoursCount = source.HoursCount,
        };
    }

    public RideResponse GetRideDTO(Ride source)
    {
        return new RideResponse
        {
            Id = source.Id,
            Status = source.Status,
            StartTime = source.StartTime,
            EndTime = source.EndTime,
            Course = courseMapper.GetShortDTO(source.Course),
            HoursCount = source.HoursCount,
            Slot = GetShortSlotDTO(source.Slot),
            Vehicle = vehicleMapper.GetShortDTO(source.Vehicle),
        };
    }

    public RideResponse GetRideDTO(CanceledRide source)
    {
        return new RideResponse
        {
            Id = source.Id,
            Status = RideStatus.Canceled,
            StartTime = source.StartTime,
            EndTime = source.EndTime,
            Course = courseMapper.GetShortDTO(source.Course),
            HoursCount = source.HoursCount,
            Slot = null,
            Vehicle = vehicleMapper.GetShortDTO(source.Vehicle),
        };
    }

    public List<ShortRideSlotResponse> MapToShortSlotDTO(List<RideSlot> source)
    {
        return source.Select(GetShortSlotDTO).ToList();
    }

    public List<RideSlotResponse> MapToSlotDTO(List<RideSlot> source)
    {
        return source.Select(GetSlotDTO).ToList();
    }

    public List<ShortRideResponse> MapToShortRideDTO(List<Ride> source)
    {
        return source.Select(GetShortRideDTO).ToList();
    }

    public List<RideResponse> MapToRideDTO(List<Ride> source)
    {
        return source.Select(GetRideDTO).ToList();
    }

    public List<ShortRideResponse> MapToShortRideDTO(List<CanceledRide> source)
    {
        return source.Select(GetShortRideDTO).ToList();
    }
}
