namespace WheeluAPI.DTO.Chat;

public class CreateConversationResponse
{
    public required ConversationResponse NewConversation { get; set; }

    public required List<ConversationResponse> AllConversations { get; set; }
}
