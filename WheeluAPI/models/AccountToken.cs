using System.ComponentModel.DataAnnotations;

namespace WheeluAPI.models;

public enum AccountTokenType
{
    ActivationToken,
    PasswordResetToken,
}

public class AccountToken
{
    [Key]
    public Guid Id { get; set; }
    public required Guid Token { get; set; }
    public required AccountTokenType TokenType { get; set; }
    public virtual required User User { get; set; }
    public required DateTime CreatedAt { get; set; }
}
