using WheeluAPI.DTO.Schedule;
using WheeluAPI.Models;

namespace WheeluAPI.DTO.Course;

public class ShortExamResponse
{
    public required int Id { get; set; }

    public required int CourseId { get; set; }

    public required int RideId { get; set; }

    public required DateTime Date { get; set; }

    public required ExamState State { get; set; }

    public required int PassedItems { get; set; }

    public required int TotalItems { get; set; }
}

public class ExamResponse
{
    public required int Id { get; set; }

    public required ShortCourseResponse Course { get; set; }

    public required ShortRideResponse Ride { get; set; }

    public required ExamState State { get; set; }

    public required ExamResult Result { get; set; }
}
