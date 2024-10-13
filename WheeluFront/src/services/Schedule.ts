import { RideStatus } from "../modules/enums";
import { translateGenericErrorCodes } from "../modules/utils";
import { API } from "../types/api";

export class ScheduleService {
	public static translateErrorCode(errCode: API.Schedule.Errors): string {
		switch (errCode) {
			case "InstructorNotEmployed":
				return "Tylko zatrudnieni instruktorzy mogą definiować grafik.";
			case "SlotOverlap":
				return "Ten termin nakłada się z poprzednio zdefiniowanym terminem jazdy.";
			case "InvalidDuration":
				return "Jazda musi trwać conajmniej 15min.";
			case "InvalidSlotPlacement":
				return "Nie można zaplanować terminu w przeszłości.";
			case "RideAssigned":
				return "Termin ma przypisaną jazdę.";
			default:
				return translateGenericErrorCodes(errCode);
		}
	}

	public static translateRideStatus(status: RideStatus) {
		switch (status) {
			case RideStatus.Planned:
				return "Zaplanowana";
			case RideStatus.Ongoing:
				return "Rozpoczęta";
			case RideStatus.Finished:
				return "Zakończona";
			case RideStatus.Canceled:
				return "Anulowana";
		}
	}
}
