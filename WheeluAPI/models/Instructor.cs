using System.ComponentModel.DataAnnotations.Schema;
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

    public virtual List<Review> Reviews { get; set; } = [];

    [NotMapped]
    public decimal Grade
    {
        get { return Reviews.Count > 0 ? Reviews.Average(r => r.Grade) : 0; }
    }
}
