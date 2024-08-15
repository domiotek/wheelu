import { translateGenericErrorCodes } from "../modules/utils";
import { API } from "../types/api";

export default class SchoolApplicationService {

	public static translateErrorCode(errCode: API.Application.PostNew.IEndpoint["errCodes"]): string {
		switch(errCode) {
			case "ApplicationAlreadyFiled":
				return "Ta szkoła została już zgłoszona do programu.";
			case "SchoolExists":
				return "Ta szkoła znajduje sie już w programie.";
			default:
				return translateGenericErrorCodes(errCode);
		}
	}
}