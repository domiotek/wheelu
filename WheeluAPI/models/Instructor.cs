using WheeluAPI.models;

namespace WheeluAPI.Models;

public class Instructor
{
    public int Id { get; set; }

    public virtual required User User { get; set; }

    public virtual required List<SchoolInstructor> EmploymentHistory { get; set; } = [];

    public virtual SchoolInstructor? ActiveEmployment
    {
        get { return EmploymentHistory.Where(i => !i.Detached).SingleOrDefault(); }
    }
}
