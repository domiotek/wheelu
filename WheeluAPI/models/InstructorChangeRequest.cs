using System.ComponentModel.DataAnnotations;
using WheeluAPI.models;

namespace WheeluAPI.Models;

public enum RequestStatus
{
    Pending,
    Resolved,
    Canceled,
    Rejected,
}

public enum RequestorType
{
    Student,
    Instructor,
}

public class InstructorChangeRequest
{
    public int Id { get; set; }

    public required RequestStatus Status { get; set; }

    public virtual required User Requestor { get; set; }

    public required RequestorType RequestorType { get; set; }

    public virtual required Course Course { get; set; }

    public virtual SchoolInstructor? RequestedInstructor { get; set; }

    [MaxLength(255)]
    public required string Note { get; set; }

    public required DateTime RequestedAt { get; set; }

    public required DateTime LastStatusChange { get; set; }
}
