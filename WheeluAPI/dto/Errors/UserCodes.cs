namespace WheeluAPI.DTO.Errors;

public enum ActivationTokenFetchErrors {
	AlreadyActivated,
	DBError
}

public enum SendActivationEmailErrorCodes {
	AlreadyActivated = ActivationTokenFetchErrors.AlreadyActivated,
	DBError = ActivationTokenFetchErrors.DBError,
	InvalidTemplate,
	MailServiceProblem
}

public enum ActivationTokenValidationErrors {
	DBError = ActivationTokenFetchErrors.DBError,
	InvalidToken
}