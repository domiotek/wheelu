using WheeluAPI.DTO.Instructor;

namespace WheeluAPI.DTO.Schedule;

public class ShortRideSlotResponse
{
    public required int Id { get; set; }

    public required ShortSchoolInstructorResponse Instructor { get; set; }

    public required DateTime StartTime { get; set; }

    public required DateTime EndTime { get; set; }
}

public class RideSlotResponse
{
    public required int Id { get; set; }

    public required ShortSchoolInstructorResponse Instructor { get; set; }

    public required DateTime StartTime { get; set; }

    public required DateTime EndTime { get; set; }

    public required ShortRideResponse? Ride { get; set; }
}
