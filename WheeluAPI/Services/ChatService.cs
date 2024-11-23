using Microsoft.EntityFrameworkCore;
using WheeluAPI.DTO.Errors;
using WheeluAPI.helpers;
using WheeluAPI.models;
using WheeluAPI.Models.Chat;

namespace WheeluAPI.Services;

public class ChatService(ApplicationDbContext dbContext) : BaseService
{
    public async ValueTask<Conversation?> GetConversationByIdAsync(Guid id)
    {
        return await dbContext.Conversations.FindAsync(id);
    }

    public async Task<Conversation?> CreateConversationBetweenAsync(User originator, User target)
    {
        var conversation = originator
            .Conversations.Where(c => c.Members.Contains(target))
            .FirstOrDefault();

        if (conversation is not null)
            return conversation;

        conversation = new Conversation { Members = [originator, target] };

        dbContext.Conversations.Add(conversation);

        if (await dbContext.SaveChangesAsync() == 0)
            return null;

        return conversation;
    }

    public async Task<
        ServiceActionWithDataResult<GenericConversationErrors, ChatMessage>
    > SendMessageInConversation(User originator, Conversation targetConversation, string message)
    {
        var result = new ServiceActionWithDataResult<GenericConversationErrors, ChatMessage>();

        var newMessage = new ChatMessage
        {
            Author = originator,
            Conversation = targetConversation,
            Message = message,
            Created = DateTime.UtcNow,
        };

        targetConversation.Messages.Add(newMessage);

        if (await dbContext.SaveChangesAsync() == 0)
        {
            result.ErrorCode = GenericConversationErrors.DbError;
            return result;
        }

        result.IsSuccess = true;
        result.Data = newMessage;
        return result;
    }

    public async Task<ServiceActionResult<MessageInteractionErrors>> ReadMessageInConversation(
        User originator,
        Conversation conversation,
        Guid messageID
    )
    {
        var result = new ServiceActionResult<MessageInteractionErrors>();

        var message = conversation.Messages.FirstOrDefault(m => m.Id == messageID);

        if (message is null)
        {
            result.ErrorCode = MessageInteractionErrors.MessageNotFound;
            return result;
        }

        var entry = conversation.LastReadMessages.FirstOrDefault(m =>
            m.ChatMemberId == originator.Id
        );

        if (entry is not null)
        {
            dbContext.Remove(entry);
        }

        conversation.LastReadMessages.Add(
            new LastReadMessage { ChatMember = originator, ChatMessage = message }
        );

        if (await dbContext.SaveChangesAsync() == 0)
        {
            result.ErrorCode = MessageInteractionErrors.DbError;
            return result;
        }

        result.IsSuccess = true;
        return result;
    }
}
