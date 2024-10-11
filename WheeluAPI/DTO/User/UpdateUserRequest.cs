using System.ComponentModel.DataAnnotations;

namespace WheeluAPI.DTO.User;

public class UpdateUserRequest
{
    [MinLength(2)]
    public string? Name { get; set; }

    [MinLength(2)]
    public string? Surname { get; set; }

    public DateOnly? Birthday { get; set; }
}
