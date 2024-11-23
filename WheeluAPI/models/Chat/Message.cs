using WheeluAPI.models;

namespace WheeluAPI.Models.Chat;

public class ChatMessage
{
    public Guid Id { get; set; }

    public virtual required User Author { get; set; }

    public virtual required Conversation Conversation { get; set; }

    public required string Message { get; set; }

    public required DateTime Created { get; set; }
}
