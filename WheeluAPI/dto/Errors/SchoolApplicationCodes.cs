namespace WheeluAPI.DTO.Errors;

public enum SchoolApplicationErrorCodes {
	ApplicationAlreadyFiled,
	SchoolExists,
	RejectedTooSoon
}

public enum InitialMailErrors {
	ApplicationResolved,
	MailServiceProblem
}

public enum ApplicationRejectErrors {
	ApplicationNotFound,
	ApplicationResolved,
	MailServiceProblem,
	DbError
}

public enum ApplicationAcceptErrors {
	ApplicationNotFound,
	ApplicationResolved,
	MailServiceProblem,
	DbError,
	AccountCreationProblem,
	AddressResolvingProblem
}

public enum AcceptMailErrors {
	UnexpectedApplicationStatus,
	TokenProblem,
	MailServiceProblem
}