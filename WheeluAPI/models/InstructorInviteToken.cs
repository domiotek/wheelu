using System.ComponentModel.DataAnnotations;
using WheeluAPI.models;

namespace WheeluAPI.Models;

public class InstructorInviteToken
{
    [Key]
    public Guid Id { get; set; }

    public required Guid Token { get; set; }

    public virtual required School TargetSchool { get; set; }

    public required string Email { get; set; }

    public required DateTime CreatedAt { get; set; }
}
