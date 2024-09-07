import { translateGenericErrorCodes } from "../modules/utils";
import { API } from "../types/api";

export default class SchoolService {
	public static translateSchoolUpdateErrorCode(
		errCode: API.School.Update.IEndpoint["errCodes"]
	): string {
		switch (errCode) {
			case "SchoolNotFound":
				return "Szkoła (już?) nie istnieje.";
			case "AccessDenied":
				return "Nie masz uprawnień, aby dokonać tych zmian.";
			case "InvalidFile":
				return "Wspierane formaty zdjęć to .png oraz .jpg, a maksymalny rozmiar pliku to 5MB.";
			case "AddressResolvingError":
				return "Podany adres wydaje się być niepoprawny.";
			default:
				return translateGenericErrorCodes(errCode);
		}
	}
}
