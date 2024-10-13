using System.ComponentModel.DataAnnotations.Schema;
using WheeluAPI.models;

namespace WheeluAPI.Models;

public enum RideStatus
{
    Planned,
    Ongoing,
    Finished,
    Canceled,
}

public class Ride
{
    public int Id { get; set; }

    public required RideStatus Status { get; set; } = RideStatus.Planned;

    public virtual required RideSlot Slot { get; set; }

    public virtual required Course Course { get; set; }

    public virtual required User Student { get; set; }

    public virtual required SchoolInstructor Instructor { get; set; }

    public DateTime? StartTime { get; set; }

    public DateTime? EndTime { get; set; }

    public virtual required Vehicle.Vehicle Vehicle { get; set; }

    [NotMapped]
    public double HoursCount
    {
        get
        {
            var startTime = StartTime ?? Slot.StartTime;
            var endTime = EndTime ?? Slot.EndTime;

            var diff = (endTime - startTime).TotalHours;

            return Math.Round(diff * 2) / 2;
        }
    }
}

public class CanceledRide
{
    public int Id { get; set; }

    public virtual required Course Course { get; set; }

    public virtual required User Student { get; set; }

    public virtual required SchoolInstructor Instructor { get; set; }

    public required DateTime StartTime { get; set; }

    public required DateTime EndTime { get; set; }

    public virtual required Vehicle.Vehicle Vehicle { get; set; }

    public virtual required User CanceledBy { get; set; }

    public required DateTime CanceledAt { get; set; }

    [NotMapped]
    public double HoursCount
    {
        get { return 0; }
    }
}
