using System.ComponentModel.DataAnnotations.Schema;
using WheeluAPI.models;

namespace WheeluAPI.Models;

public class SchoolInstructor
{
    public int Id { get; set; }

    public virtual required Instructor Instructor { get; set; }

    public virtual required School School { get; set; }

    public required bool Detached { get; set; }

    public virtual required List<EmploymentRecord> EmploymentRecords { get; set; }

    public required bool Visible { get; set; }

    [NotMapped]
    public List<Course> AssignedCourses
    {
        get { return Courses.Where(c => c.Instructor.Id == Id).ToList(); }
    }

    [NotMapped]
    public List<Course> ActiveCourses
    {
        get { return AssignedCourses.Where(c => !c.Archived).ToList(); }
    }

    public required int MaximumConcurrentStudents { get; set; }

    public virtual required List<CourseCategory> AllowedCategories { get; set; } = [];

    public virtual required List<Course> Courses { get; set; } = [];
}
