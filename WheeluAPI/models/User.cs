using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;
using WheeluAPI.DTO.User;
using WheeluAPI.Models;
using WheeluAPI.Models.Chat;

namespace WheeluAPI.models;

public class User : IdentityUser
{
    public required string Name { get; set; }

    public required string Surname { get; set; }

    public required DateOnly Birthday { get; set; }

    public required DateTime CreatedAt { get; set; }

    public required DateTime LastPasswordChange { get; set; }

    public DateTime? LastSeen { get; set; }

    [InverseProperty(nameof(School.Owner))]
    public virtual School? OwnedSchool { get; set; }

    [InverseProperty(nameof(Ride.Student))]
    public virtual required List<Ride> Rides { get; set; }

    public virtual List<Conversation> Conversations { get; set; } = [];

    public ShortUserResponse GetShortDTO()
    {
        return new ShortUserResponse
        {
            Id = Id,
            Name = Name,
            Surname = Surname,
        };
    }

    public UserResponse GetDTO()
    {
        return new UserResponse
        {
            Id = Id,
            Name = Name,
            Email = Email!,
            Surname = Surname,
            Birthday = Birthday,
            CreatedAt = CreatedAt,
            IsActivated = EmailConfirmed,
            LastPasswordChange = LastPasswordChange,
        };
    }
}
