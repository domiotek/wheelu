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

public enum GenericTokenActionErrors {
	DBError = ActivationTokenFetchErrors.DBError,
	InvalidToken
}

public enum SendRecoveryEmailErrorCodes {
	DBError = ActivationTokenFetchErrors.DBError,
	InvalidTemplate,
	MailServiceProblem
}

public enum ChangePasswordTokenActionErrors {
	DBError = ActivationTokenFetchErrors.DBError,
	InvalidToken = GenericTokenActionErrors.InvalidToken,
	PasswordRequirementsNotMet = UserSignUpErrorCode.PasswordRequirementsNotMet
}