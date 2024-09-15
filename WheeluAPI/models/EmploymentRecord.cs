namespace WheeluAPI.Models;

public class EmploymentRecord
{
    public int Id { get; set; }

    public virtual required SchoolInstructor Instructor { get; set; }

    public required DateTime StartTime { get; set; } = DateTime.UtcNow;

    public DateTime? EndTime { get; set; } = null;
}
