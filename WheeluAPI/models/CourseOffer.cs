using WheeluAPI.models;

namespace WheeluAPI.Models;

public class CourseOffer
{
    public int Id { get; set; }

    public virtual required CourseCategory Category { get; set; }

    public required bool Enabled { get; set; }

    public required int HoursCount { get; set; }

    public virtual required School School { get; set; }

    public required decimal Price { get; set; }

    public required decimal PricePerHour { get; set; }

    public required DateTime CreatedAt { get; set; }

    public required DateTime LastUpdatedAt { get; set; }
}
