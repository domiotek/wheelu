using System.Collections.Concurrent;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using WheeluAPI.DTO.Chat;
using WheeluAPI.DTO.Errors;
using WheeluAPI.Mappers;
using WheeluAPI.models;
using WheeluAPI.Models.Chat;
using WheeluAPI.Services;

namespace WheeluAPI.Hubs;

[Authorize]
public class ChatHub(IUserService userService, ChatMapper mapper, ChatService service) : Hub
{
    private static readonly ConcurrentDictionary<string, List<string>> UserSessions = new();

    public override async Task OnConnectedAsync()
    {
        var user = await GetUserAsync();
        var connectionId = Context.ConnectionId;

        await userService.UpdateUserLastSeenAsync(user, DateTime.UtcNow);

        UserSessions.AddOrUpdate(
            user.Id,
            new List<string> { connectionId },
            (key, existingConnections) =>
            {
                lock (existingConnections)
                {
                    existingConnections.Add(connectionId);
                }
                return existingConnections;
            }
        );

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var user = await GetUserAsync();
        var connectionId = Context.ConnectionId;

        await userService.UpdateUserLastSeenAsync(user, DateTime.UtcNow);

        if (UserSessions.TryGetValue(user.Id, out var connections))
        {
            lock (connections)
            {
                connections.Remove(connectionId);
                if (connections.Count == 0)
                {
                    UserSessions.TryRemove(user.Id, out _);
                }
            }
        }

        await base.OnDisconnectedAsync(exception);
    }

    public async Task<IEnumerable<ConversationResponse>> GetConversations()
    {
        var user = await GetUserAsync();

        if (user == null)
        {
            Context.Abort();
            return [];
        }

        var activeUsers = user
            .Conversations.SelectMany(c => c.Members.Where(m => m.Id != user.Id))
            .Where(u => CheckUserActivityStatus(u.Id))
            .Select(u => u.Id)
            .ToList();

        return mapper.MapConversationToDTO(
            user.Conversations.OrderBy(c => c.Messages.LastOrDefault()?.Created),
            user,
            activeUsers
        );
    }

    public async Task<
        ServiceActionWithDataResult<ConversationCreationErrors, CreateConversationResponse>
    > CreateConversationWithTarget(string userId)
    {
        var result =
            new ServiceActionWithDataResult<
                ConversationCreationErrors,
                CreateConversationResponse
            >();

        var requestor = await GetUserAsync();

        var target = await userService.GetUserByIDAsync(userId);

        if (requestor is null)
        {
            Context.Abort();
            result.ErrorCode = ConversationCreationErrors.NotAuthorized;
            return result;
        }

        if (target is null)
        {
            result.ErrorCode = ConversationCreationErrors.InvalidTargetUser;
            return result;
        }

        if (requestor.Id == target.Id)
        {
            result.ErrorCode = ConversationCreationErrors.SameParties;
            return result;
        }

        var conversation = await service.CreateConversationBetweenAsync(requestor, target);

        if (conversation is null)
            return result;

        result.IsSuccess = true;
        result.Data = new CreateConversationResponse
        {
            NewConversation = mapper.GetConversationDTO(conversation, requestor),
            AllConversations = (await GetConversations()).ToList(),
        };

        return result;
    }

    public async Task<
        ServiceActionWithDataResult<GenericConversationErrors, ChatMessageResponse>
    > SendMessageInConversation(string conversationID, string message)
    {
        var result =
            new ServiceActionWithDataResult<GenericConversationErrors, ChatMessageResponse>();

        var requestor = await GetUserAsync();

        var validation = await ValidateConversationAccess(conversationID, requestor);

        if (!validation.IsSuccess)
        {
            result.ErrorCode = validation.ErrorCode;
            return result;
        }

        var response = await service.SendMessageInConversation(
            requestor,
            validation.Data!,
            message
        );

        if (!response.IsSuccess)
        {
            result.ErrorCode = response.ErrorCode;
            return result;
        }

        SyncAllConversationMembers(validation.Data!);

        result.IsSuccess = true;
        result.Data = mapper.GetMessageDTO(response.Data!);
        return result;
    }

    public async Task<
        ServiceActionWithDataResult<GenericConversationErrors, List<ChatMessageResponse>>
    > GetConversationMessages(string conversationID)
    {
        var result =
            new ServiceActionWithDataResult<GenericConversationErrors, List<ChatMessageResponse>>();

        var validation = await ValidateConversationAccess(conversationID);

        if (!validation.IsSuccess)
        {
            result.ErrorCode = validation.ErrorCode;
            return result;
        }

        result.IsSuccess = true;
        result.Data = mapper
            .MapMessageToDTO(validation.Data!.Messages.OrderBy(m => m.Created))
            .ToList();

        return result;
    }

    public async Task<ServiceActionResult<MessageInteractionErrors>> ReadMessage(
        string conversationID,
        string messageID
    )
    {
        var result = new ServiceActionResult<MessageInteractionErrors>();

        var originator = await GetUserAsync();

        var validation = await ValidateConversationAccess(conversationID, originator);

        if (!validation.IsSuccess)
        {
            result.ErrorCode = (MessageInteractionErrors)validation.ErrorCode;
            return result;
        }

        var serviceResult = await service.ReadMessageInConversation(
            originator,
            validation.Data!,
            Guid.Parse(messageID)
        );

        if (!serviceResult.IsSuccess)
        {
            result.ErrorCode = serviceResult.ErrorCode;
            return result;
        }

        SyncAllConversationMembers(validation.Data!);

        result.IsSuccess = true;
        return result;
    }

    private Task<User> GetUserAsync()
    {
        return userService.GetUserByEmailAsync(Context.UserIdentifier ?? "")!;
    }

    private void SendToUserOnAllSessions(string userId, Action<string> handler)
    {
        if (UserSessions.TryGetValue(userId, out var connections))
        {
            foreach (var connectionId in connections)
            {
                handler(connectionId);
            }
        }
    }

    private async Task<
        ServiceActionWithDataResult<GenericConversationErrors, Conversation>
    > ValidateConversationAccess(string conversationID, User? requestor = null)
    {
        var result = new ServiceActionWithDataResult<GenericConversationErrors, Conversation>();

        requestor ??= await GetUserAsync();

        if (requestor is null)
        {
            Context.Abort();
            result.ErrorCode = GenericConversationErrors.NotAuthorized;
            return result;
        }

        var conversation = await service.GetConversationByIdAsync(Guid.Parse(conversationID));

        if (conversation is null)
        {
            result.ErrorCode = GenericConversationErrors.InvalidConversation;
            return result;
        }

        if (!conversation.Members.Contains(requestor))
        {
            result.ErrorCode = GenericConversationErrors.AccessDenied;
            return result;
        }

        result.IsSuccess = true;
        result.Data = conversation;
        return result;
    }

    private void SyncAllConversationMembers(Conversation conversation)
    {
        conversation.Members.ForEach(member =>
        {
            var conversationDTO = mapper.GetConversationDTO(conversation, member);
            var isOtherPartyActive = CheckUserActivityStatus(conversationDTO.OtherParty.Id);

            if (isOtherPartyActive)
                conversationDTO.OtherPartyLastSeen = DateTime.UtcNow;

            SendToUserOnAllSessions(
                member.Id,
                (connectionId) =>
                {
                    Clients.Client(connectionId).SendAsync("syncConversation", conversationDTO);
                }
            );
        });
    }

    private bool CheckUserActivityStatus(string userId)
    {
        if (UserSessions.TryGetValue(userId, out _))
            return true;

        return false;
    }
}
