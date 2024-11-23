using WheeluAPI.models;

namespace WheeluAPI.Models.Chat;

public class Conversation
{
    public Guid Id { get; set; }

    public virtual List<ChatMessage> Messages { get; set; } = [];

    public virtual List<User> Members { get; set; } = [];

    public virtual List<LastReadMessage> LastReadMessages { get; set; } = [];
}
