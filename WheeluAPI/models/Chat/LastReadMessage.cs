using WheeluAPI.models;

namespace WheeluAPI.Models.Chat;

public class LastReadMessage
{
    public string ChatMemberId { get; set; } = null!;
    public Guid ChatMessageId { get; set; }

    public virtual required User ChatMember { get; set; }
    public virtual required ChatMessage ChatMessage { get; set; }
}
