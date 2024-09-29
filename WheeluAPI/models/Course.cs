using System.ComponentModel.DataAnnotations.Schema;
using WheeluAPI.models;

namespace WheeluAPI.Models;

public class Course
{
    public int Id { get; set; }

    public bool TransactionComplete { get; set; } = false;

    public required CourseCategoryType Category { get; set; }

    public virtual CourseOffer? Offer { get; set; }

    public virtual required School School { get; set; }

    public virtual required User Student { get; set; }

    public virtual required SchoolInstructor Instructor { get; set; }

    public required int HoursCount { get; set; }

    public required decimal PricePerHour { get; set; }

    public required DateTime CreatedAt { get; set; }

    public virtual required List<Transaction> Transactions { get; set; }

    [NotMapped]
    public bool Archived
    {
        get { return false; }
    }
}
