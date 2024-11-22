using System.ComponentModel.DataAnnotations.Schema;
using WheeluAPI.Models;
using WheeluAPI.Models.Vehicle;

namespace WheeluAPI.models;

public enum SchoolUpdateMode
{
    Owner,
    Administrator,
}

public class School
{
    public int Id { get; set; }

    public required bool Hidden { get; set; }

    public bool Blocked { get; set; } = false;

    public required string Name { get; set; }

    public string? Description { get; set; }

    public required string NIP { get; set; }

    public virtual required User Owner { get; set; }

    [ForeignKey(nameof(Owner))]
    public required string OwnerId { get; set; }

    public virtual required Address Address { get; set; }

    public required DateOnly Established { get; set; }

    public required DateTime Joined { get; set; }

    public required string PhoneNumber { get; set; }

    public string? Email { get; set; } = null;

    public virtual required Image CoverImage { get; set; }

    public virtual required List<City> NearbyCities { get; set; }

    public virtual required List<CourseOffer> CourseOffers { get; set; }

    [InverseProperty("School")]
    public virtual required List<SchoolInstructor> Instructors { get; set; }

    [NotMapped]
    public List<SchoolInstructor> ActiveInstructors
    {
        get { return Instructors.Where(i => !i.Detached).ToList(); }
    }

    public virtual required List<Vehicle> Vehicles { get; set; }

    public virtual required List<Course> Courses { get; set; } = [];

    [NotMapped]
    public List<Course> ActiveCourses
    {
        get { return Courses.Where(c => !c.Archived && c.TransactionComplete).ToList(); }
    }

    public virtual List<Review> Reviews { get; set; } = [];

    [NotMapped]
    public decimal Grade
    {
        get { return Reviews.Count > 0 ? Reviews.Average(r => r.Grade) : 0; }
    }
}
