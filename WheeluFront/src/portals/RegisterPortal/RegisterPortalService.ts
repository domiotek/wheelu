import { translateGenericErrorCodes } from "../../modules/utils";
import { API } from "../../types/api";

export default class RegisterPortalService {
	public static translateErrorCode(
		code: API.Auth.SignUp.IEndpoint["errCodes"]
	): string {
		switch (code) {
			case "EmailAlreadyTaken":
				return "Ten email jest już zajęty.";
			case "PasswordRequirementsNotMet":
				return "Hasło nie spełnia wymagań.";
			case "EmailDeliveryProblem":
				return "Nie udało się wysłać wiadomości aktywacyjnej. Spróbuj ponownie za chwilę.";
			default:
				return translateGenericErrorCodes(code);
		}
	}
}
