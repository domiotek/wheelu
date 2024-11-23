using WheeluAPI.DTO.User;

namespace WheeluAPI.DTO.Chat;

public class ChatMessageResponse
{
    public required string Id { get; set; }

    public required ShortUserResponse Author { get; set; }

    public required string ConversationId { get; set; }

    public required string Message { get; set; }

    public required DateTime Created { get; set; }
}
