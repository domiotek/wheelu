using WheeluAPI.DTO.Chat;
using WheeluAPI.models;
using WheeluAPI.Models.Chat;

namespace WheeluAPI.Mappers;

public class ChatMapper
{
    public ConversationResponse GetConversationDTO(
        Conversation source,
        User perspective,
        bool overwriteLastSeen = false
    )
    {
        var lastMessage = source.Messages.LastOrDefault();
        var lastReadMessages = source.LastReadMessages.ToDictionary(
            m => m.ChatMemberId,
            m => GetMessageDTO(m.ChatMessage)
        )!;

        var otherParty = source.Members.Where(m => m.Id != perspective.Id).First();

        return new ConversationResponse
        {
            Id = source.Id.ToString(),
            OtherParty = otherParty.GetShortDTO(),
            OtherPartyLastSeen = overwriteLastSeen ? DateTime.UtcNow : otherParty.LastSeen,
            LastMessage = lastMessage is not null ? GetMessageDTO(lastMessage) : null,
            LastReadMessages = lastReadMessages,
        };
    }

    public IEnumerable<ConversationResponse> MapConversationToDTO(
        IEnumerable<Conversation> source,
        User perspective,
        List<string>? activeUsers = null
    )
    {
        return source.Select(s =>
        {
            var dto = GetConversationDTO(s, perspective);
            if (activeUsers is not null && activeUsers.Contains(dto.OtherParty.Id))
                dto.OtherPartyLastSeen = DateTime.UtcNow;

            return dto;
        });
    }

    public ChatMessageResponse GetMessageDTO(ChatMessage source)
    {
        return new ChatMessageResponse
        {
            Id = source.Id.ToString(),
            Author = source.Author.GetShortDTO(),
            ConversationId = source.Conversation.Id.ToString(),
            Message = source.Message,
            Created = source.Created,
        };
    }

    public IEnumerable<ChatMessageResponse> MapMessageToDTO(IEnumerable<ChatMessage> source)
    {
        return source.Select(GetMessageDTO);
    }
}
