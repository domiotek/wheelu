namespace WheeluAPI.DTO.Instructor;

public class EmploymentRecordResponse
{
    public int Id { get; set; }

    public required DateTime StartTime { get; set; } = DateTime.UtcNow;

    public DateTime? EndTime { get; set; }
}
