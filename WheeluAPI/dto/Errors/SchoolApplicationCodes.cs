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

public enum RejectionErrors {
	ApplicationNotFound,
	ApplicationResolved,
	MailServiceProblem,
	DbError
}