using WheeluAPI.DTO.Course;
using WheeluAPI.Models;

namespace WheeluAPI.Mappers;

public class ExamMapper(CourseMapper courseMapper, ScheduleMapper scheduleMapper)
{
    public ShortExamResponse GetShortDTO(Exam source)
    {
        return new ShortExamResponse
        {
            Id = source.Id,
            CourseId = source.Course.Id,
            RideId = source.Ride.Id,
            Date = source.Ride.StartTime ?? source.Ride.Slot!.StartTime,
            State = source.State,
            PassedItems = source.ExamResult.PassedItems,
            TotalItems = source.ExamResult.TotalItems,
        };
    }

    public ExamResponse GetDTO(Exam source)
    {
        return new ExamResponse
        {
            Id = source.Id,
            Course = courseMapper.GetShortDTO(source.Course),
            Ride = scheduleMapper.GetShortRideDTO(source.Ride),
            State = source.State,
            Result = source.ExamResult,
        };
    }

    public IEnumerable<ShortExamResponse> MapToShortDTO(IEnumerable<Exam> source)
    {
        return source.Select(GetShortDTO);
    }

    public IEnumerable<ExamResponse> MapToDTO(IEnumerable<Exam> source)
    {
        return source.Select(GetDTO);
    }
}
