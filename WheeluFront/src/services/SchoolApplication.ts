import { translateGenericErrorCodes } from "../modules/utils";
import { API } from "../types/api";

export default class SchoolApplicationService {
	public static translateApplicationSubmitErrorCode(
		errCode: API.Application.PostNew.IEndpoint["errCodes"]
	): string {
		switch (errCode) {
			case "ApplicationAlreadyFiled":
				return "Ta szkoła została już zgłoszona do programu.";
			case "SchoolExists":
				return "Ta szkoła znajduje sie już w programie.";
			case "RejectedTooSoon":
				return "Twój poprzedni wniosek został odrzucony zbyt niedawno. Musi minąć conajmniej 7 dni od daty odrzucenia wniosku, zanim będziesz mógł/mogła złożyć kolejny.";
			case "UserExists":
				return "Istnieje już użytkownik zarejestrowany na podany adres email.";
			default:
				return translateGenericErrorCodes(errCode);
		}
	}

	public static translateApplicationResolveErrorCode(
		errCode: API.Application.ResolveErrorCodes
	): string {
		switch (errCode) {
			case "ApplicationNotFound":
				return "Wniosek nie istnieje.";
			case "ApplicationResolved":
				return "Wniosek został już rozpatrzony.";
			case "MailServiceProblem":
				return "Wystąpił problem z klientem pocztowym.";
			default:
				return translateGenericErrorCodes(errCode);
		}
	}

	public static translateApplicationStatus(
		status: App.Models.IApplication["status"]
	) {
		switch (status) {
			case "pending":
				return "Oczekująca";
			case "rejected":
				return "Odrzucona";
			case "accepted":
				return "Zaakceptowana";
			default:
				return "?";
		}
	}
}
