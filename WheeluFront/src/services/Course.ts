import { requestorType, RequestStatus, SkillLevel } from "../modules/enums";
import { App } from "../types/app";

export default class CourseService {
	public static readonly skillColorMapping = {
		[SkillLevel.None]: undefined,
		[SkillLevel.Medium]: "warning",
		[SkillLevel.Good]: "info",
		[SkillLevel.Excelent]: "success",
	} as const;

	public static getCourseAlertText(
		id: string,
		role: "student" | "instructor" | "other" = "other",
		params: string[] = []
	) {
		switch (id) {
			case "plannedRide_title":
				return "Zaplanowana jazda";
			case "plannedRide_future_content":
				switch (role) {
					case "student":
						return `Masz zaplanowaną jazdę - ${params[0]}.`;
					default:
						return `Następna zaplanowana jazda - ${params[0]}.`;
				}
			case "plannedRide_start_now_content":
				switch (role) {
					case "student":
						return "Czas na Twoją jazdę. Bezpiecznej i owocnej nauki.";
					case "instructor":
						return "Czas na zaplanowaną jazdę. Rozpocznij ją klikając w przycisk obok.";
					default:
						return "Zaplanowana jazda powinna odbyć się lada chwila.";
				}
			case "plannedRide_past_content":
				switch (role) {
					case "student":
						return `Miałeś zaplanowaną jazdę (${params[0]}), lecz się ona nie odbyła (a przynajmniej my nic o niej nie wiemy).`;
					case "instructor":
						return `Ostatnia zaplanowana jazda (${params[0]}) nie odbyła się. Anuluj ją przyciskiem obok.`;
					default:
						return `Ostatnia zaplanowana jazda (${params[0]}) nie odbyła się.`;
				}
			case "no_ride_title":
				return "Brak zaplanowej jazdy";
			case "no_ride_content":
				switch (role) {
					case "student":
						return `Wybierz dogodny dla Ciebie termin z tych udostępnionych przez instruktora.`;
					case "instructor":
						return `Kursant nie zaplanował jeszcze jazdy. Pamiętaj, że w ostateczności możesz zrobić to za niego.`;
					case "other":
						return `Następna jazda w tym kursie nie została jeszcze zaplanowana.`;
				}
			case "ongoingRide_title":
				return "Trwająca jazda";
			case "ongoingRide_content":
				switch (role) {
					case "student":
						return "Bezpiecznej i owocnej nauki.";
					case "instructor":
						return `Pamiętaj o zmianie stanu po zakończeniu jazdy 😉 Jazda planowo powinna zakończyć się o ${params[1]}.`;
					case "other":
						return `Rozpoczęta - ${params[0]}. Planowe zakończenie - ${params[1]}.`;
				}
		}

		return "";
	}

	public static formatRequestStatus(status: RequestStatus) {
		switch (status) {
			case RequestStatus.Canceled:
				return "Anulowany";
			case RequestStatus.Pending:
				return "Oczekujący";
			case RequestStatus.Rejected:
				return "Odrzucony";
			case RequestStatus.Resolved:
				return "Zrealizowany";
		}
	}

	public static formatRequestorType(type: requestorType) {
		switch (type) {
			case requestorType.Student:
				return "Kursant";
			case requestorType.Instructor:
				return "Instruktor";
		}
	}

	public static formatCourseProgressGroup(
		group: keyof App.Models.ICourseProgress
	) {
		switch (group) {
			case "generalSkills":
				return "Ogólne";
			case "developedAreaSkills":
				return "Ruch w obszarze zabudowanym";
			case "undevelopedAreaSkills":
				return "Ruch w obszarze niezabudowanym";
			case "highwaySkills":
				return "Ruch na drodze ekspresowej";
			case "maneuverSkills":
				return "Manewry";
		}
	}

	public static formatCourseProgressSkill(skill: string) {
		switch (skill) {
			case "preparingVehicle":
				return "Przygotowanie pojazdu do jazdy";
			case "clutchAndShifting":
				return "Obsługa sprzęgła i zmiana biegów";
			case "componentKnowledge":
				return "Znajomość podzespołów pojazdu";
			case "lightsHandling":
				return "Obsługa świateł";
			case "harshConditionsDriving":
				return "Jazda w trudnych warunkacj pogodowych";
			case "roundaboutCrossing":
				return "Przejazd przez rondo";
			case "laneChanging":
				return "Zmiana pasa ruchu";
			case "classicIntersection":
				return "Przejazd przez skrzyżowanie";
			case "givingWayPedestrians":
				return "Ustąpienie pierwszeństwa pieszym";
			case "givingWayVehicles":
				return "Ustąpienie pierwszeństwa pojazdom";
			case "bicycleOvertaking":
				return "Wyprzedzanie rowerzystów";
			case "overtaking":
			case "vehicleOvertaking":
				return "Wyprzedzanie pojazdów";
			case "dynamicDriving":
				return "Dynamiczna jazda";
			case "speedAdjusting":
				return "Dostosowanie prędkości do warunków";
			case "perpendicularParking":
				return "Parkowanie prostopadłe";
			case "parallelParking":
				return "Parkowanie równoległe";
			case "diagonalParking":
				return "Parkowanie skośne";
			case "startingUpTheHill":
				return "Ruszanie ze wzniesienia";
			case "stoppingAtDestination":
				return "Zatrzymanie w wyznaczonym miejscu";
			case "turningAroundOnIntersection":
				return "Zawrót na skrzyżowaniu";
			case "turningAroundUsingInfrastructure":
				return "Zawrót z użyciem infrastruktury";
			default:
				return skill;
		}
	}
}
