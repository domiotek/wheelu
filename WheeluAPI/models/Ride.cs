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

public interface IRide
{
    public int Id { get; set; }

    public RideStatus Status { get; set; }

    public RideSlot? Slot { get; set; }

    public Course Course { get; set; }

    public User Student { get; set; }

    public SchoolInstructor Instructor { get; set; }

    public DateTime? StartTime { get; set; }

    public DateTime? EndTime { get; set; }

    public Vehicle.Vehicle Vehicle { get; set; }

    public double HoursCount { get; }
}

public class Ride : IRide
{
    public int Id { get; set; }

    public required RideStatus Status { get; set; } = RideStatus.Planned;

#pragma warning disable CS8767 // Nullability of reference types in type of parameter doesn't match implicitly implemented member (possibly because of nullability attributes).
    public virtual required RideSlot Slot { get; set; }
#pragma warning restore CS8767 // Nullability of reference types in type of parameter doesn't match implicitly implemented member (possibly because of nullability attributes).

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

public class CanceledRide : IRide
{
    public int Id { get; set; }

    [NotMapped]
    public required RideStatus Status { get; set; } = RideStatus.Canceled;

    [NotMapped]
    public required RideSlot? Slot { get; set; } = null;

    public virtual required Course Course { get; set; }

    public virtual required User Student { get; set; }

    public virtual required SchoolInstructor Instructor { get; set; }

    public DateTime? StartTime { get; set; }

    public DateTime? EndTime { get; set; }

    public virtual required Vehicle.Vehicle Vehicle { get; set; }

    public virtual required User CanceledBy { get; set; }

    public required DateTime CanceledAt { get; set; }

    [NotMapped]
    public double HoursCount
    {
        get { return 0; }
    }
}
