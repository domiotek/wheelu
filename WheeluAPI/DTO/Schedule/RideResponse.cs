using WheeluAPI.DTO.Course;
using WheeluAPI.DTO.Vehicle;
using WheeluAPI.Models;

namespace WheeluAPI.DTO.Schedule;

public class ShortRideResponse
{
    public required int Id { get; set; }

    public required RideStatus Status { get; set; }

    public ShortRideSlotResponse? Slot { get; set; }

    public required ShortCourseResponse Course { get; set; }

    public DateTime? StartTime { get; set; }

    public DateTime? EndTime { get; set; }

    public required double HoursCount { get; set; }

    public int? ExamId { get; set; }
}

public class RideResponse
{
    public required int Id { get; set; }

    public required RideStatus Status { get; set; }

    public ShortRideSlotResponse? Slot { get; set; }

    public required LimitedCourseResponse Course { get; set; }

    public DateTime? StartTime { get; set; }

    public DateTime? EndTime { get; set; }

    public required ShortVehicleResponse Vehicle { get; set; }

    public required double HoursCount { get; set; }

    public ShortExamResponse? Exam { get; set; }
}
