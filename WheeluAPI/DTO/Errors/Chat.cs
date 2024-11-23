namespace WheeluAPI.DTO.Errors;

public enum ConversationCreationErrors
{
    DbError,
    NotAuthorized,
    InvalidTargetUser,
    SameParties,
}

public enum GenericConversationErrors
{
    DbError,
    NotAuthorized,
    InvalidConversation,
    AccessDenied,
}

public enum MessageInteractionErrors
{
    DbError,
    NotAuthorized,
    InvalidConversation,
    AccessDenied,
    MessageNotFound,
}
