namespace WheeluAPI.Models;

public class HoursPackage
{
    public int Id { get; set; }

    public virtual required Course Course { get; set; }

    public virtual Transaction? Transaction { get; set; }

    public required int HoursCount { get; set; }

    public required DateTime Created { get; set; }
}
