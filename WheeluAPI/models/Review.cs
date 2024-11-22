using System.ComponentModel.DataAnnotations;
using WheeluAPI.models;

namespace WheeluAPI.Models;

public class Review
{
    public int Id { get; set; }

    public virtual required School School { get; set; }

    public virtual required Course Course { get; set; }

    public virtual Instructor? Instructor { get; set; }

    public virtual required User Student { get; set; }

    public required decimal Grade { get; set; }

    public required bool Edited { get; set; }

    [MaxLength(255)]
    public string? Message { get; set; }

    public required DateTime Created { get; set; }

    public required DateTime Updated { get; set; }
}
