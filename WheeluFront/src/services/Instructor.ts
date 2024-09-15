import { translateGenericErrorCodes } from "../modules/utils";
import { API } from "../types/api";

export default class InstructorService {
	public static translateInviteSubmitErrorCode(
		errCode: API.Instructors.SendInvite.IEndpoint["errCodes"]
	): string {
		switch (errCode) {
			case "AlreadyEmployed":
				return "Ten instruktor jest już zatrudniony. Instruktor może być zatrudniony tylko w jednej szkole.";
			case "InvalidAccountType":
				return "Konto o takim adresie email już istnieje, jednak nie jest ono typem instruktora.";
			case "MailServiceProblem":
				return "Nie udało się wysłać maila z zaproszeniem.";
			default:
				return translateGenericErrorCodes(errCode);
		}
	}
}
