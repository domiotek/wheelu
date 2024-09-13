using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;
using WheeluAPI.DTO.User;

namespace WheeluAPI.models;

public class User : IdentityUser
{
    public required string Name { get; set; }

    public required string Surname { get; set; }

    public required DateOnly Birthday { get; set; }

    public required DateTime CreatedAt { get; set; }

    public required DateTime LastPasswordChange { get; set; }

    [InverseProperty(nameof(School.Owner))]
    public virtual School? OwnedSchool { get; set; }

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
