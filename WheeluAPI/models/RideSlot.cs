using System.ComponentModel.DataAnnotations.Schema;

namespace WheeluAPI.Models;

public class RideSlot
{
    public int Id { get; set; }

    public virtual required SchoolInstructor Instructor { get; set; }

    public required DateTime StartTime { get; set; }

    public required DateTime EndTime { get; set; }

    public virtual Ride? Ride { get; set; }

    [ForeignKey(nameof(Ride))]
    public int? RideId { get; set; }
}
