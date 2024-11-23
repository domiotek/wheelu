using WheeluAPI.DTO.User;

namespace WheeluAPI.DTO.Chat;

public class ConversationResponse
{
    public required string Id { get; set; }

    public required ShortUserResponse OtherParty { get; set; }

    public required DateTime? OtherPartyLastSeen { get; set; }

    public required ChatMessageResponse? LastMessage { get; set; }

    public required Dictionary<string, ChatMessageResponse> LastReadMessages { get; set; }
}
