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

    public ShortRideResponse GetShortRideDTO(IRide source)
    {
        return new ShortRideResponse
        {
            Id = source.Id,
            Slot = source.Slot != null ? GetShortSlotDTO(source.Slot) : null,
            Status = source.Status,
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
            Course = courseMapper.GetLimitedDTO(source.Course),
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
            Course = courseMapper.GetLimitedDTO(source.Course),
            HoursCount = source.HoursCount,
            Slot = null,
            Vehicle = vehicleMapper.GetShortDTO(source.Vehicle),
        };
    }

    public IEnumerable<ShortRideSlotResponse> MapToShortSlotDTO(IEnumerable<RideSlot> source)
    {
        return source.Select(GetShortSlotDTO);
    }

    public IEnumerable<RideSlotResponse> MapToSlotDTO(IEnumerable<RideSlot> source)
    {
        return source.Select(GetSlotDTO);
    }

    public IEnumerable<ShortRideResponse> MapToShortRideDTO(IEnumerable<IRide> source)
    {
        return source.Select(GetShortRideDTO);
    }

    public IEnumerable<RideResponse> MapToRideDTO(IEnumerable<Ride> source)
    {
        return source.Select(GetRideDTO);
    }

    public IEnumerable<RideResponse> MapToRideDTO(IEnumerable<CanceledRide> source)
    {
        return source.Select(GetRideDTO);
    }
}
