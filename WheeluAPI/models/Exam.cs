using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;

namespace WheeluAPI.Models;

public enum ExamState
{
    Planned,
    Ongoing,
    Canceled,
    Passed,
    Failed,
}

public class Exam
{
    public int Id { get; set; }

    public virtual required Course Course { get; set; }

    [NotMapped]
    public IRide Ride
    {
        get
        {
            return (
                State != ExamState.Canceled
                    ? Course.Rides.Find(r => r.Id == RideId)
                    : Course.CanceledRides.Find(r => r.Id == RideId)
            )!;
        }
    }

    public required int RideId { get; set; }

    public required ExamState State { get; set; }

    public string ExamResultJSON { get; set; } = "{}";

    [NotMapped]
    public ExamResult ExamResult
    {
        get => JsonConvert.DeserializeObject<ExamResult>(ExamResultJSON) ?? new ExamResult();
        set => ExamResultJSON = JsonConvert.SerializeObject(value);
    }
}
