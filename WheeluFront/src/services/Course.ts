import { requestorType, RequestStatus, SkillLevel } from "../modules/enums";

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
						return `Kursant nie zaplanował jeszcze jazdy. Pamiętaj, że zawsze możesz zrobić to za niego.`;
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

			case "ongoingRideExam_content":
				switch (role) {
					case "student":
						return "Powodzenia!";
					case "instructor":
						return `Pamiętaj o zmianie stanu egzaminu. Możesz to robić w trakcie, lub po jego zakończeniu 😉 Egazmin planowo powinien zakończyć się o ${params[1]}.`;
					case "other":
						return `Rozpoczęty - ${params[0]}. Planowe zakończenie - ${params[1]}.`;
				}
			case "hoursRanOut_title":
				switch (role) {
					case "student":
						return "Skończyły Ci się godziny 😕";
					default:
						return "Brak dostępnych godzin";
				}
			case "hoursRanOut_content":
				switch (role) {
					case "student":
						return "Nadal możesz się wiele nauczyć - mimo, że już teraz możesz przystąpić do oficjalnego egzaminu, być może warto dokupić kilka godzin? Egzamin wewnętrzny jest świetną okazją by zaznajomić się z formą egzaminu przed przystąpieniem do państwowego.";
					default:
						return "Aby kontynuować, kursant musi dokupić godziny.";
				}
			case "examAvailable_title":
				switch (role) {
					case "student":
						return "Możesz przystąpić do egzaminu wewnętrznego";
					case "instructor":
						return "Kursant może przystąpić do egzaminu wewnętrznego";
					case "other":
						return "Dostępny egzamin wewnętrzny";
				}
			case "examAvailable_content":
				switch (role) {
					case "student":
						return "Egzamin wewnętrzny jest idealną okazją, by zobaczyć jak wygląda państwowy egzamin na prawo jazdy. Potrzebujesz jeszcze trochę poćwiczyć? Nie ma problemu, dalej możesz zaplanować jazdy 😉";
					case "instructor":
						return "Egzamin wewnętrzny może pomóc oswoić się z egzaminem państwowym.";
					case "other":
						return "Egzamin jest już dostępny, lecz nie został jeszcze zaplanowany.";
				}
			case "complete_hours_left_title":
				switch (role) {
					case "student":
						return "Możesz przystąpić do egzaminu państwowego!";
					case "instructor":
						return "Wszystko gotowe?";
					case "other":
						return "Założenia kursu spełnione";
				}
			case "complete_hours_left_content":
				switch (role) {
					case "student":
						return "Ukończyłeś/aś wszystkie kroki w tym kursie, lecz nadal masz dostępne godziny - nadal możesz poćwiczyć jeśli chcesz. Już po egzaminie? Wypełnij ankietę.";
					case "instructor":
						return "Wszystkie kroki zostały ukończone, lecz w kursie nadal są dostępne godziny. Może się przydadzą?";
					case "other":
						return "Kursant opanował umiejętności wymagane do kierowania pojazdem oraz zdał egzamin wewnętrzny.";
				}
			case "complete_title":
				switch (role) {
					case "student":
						return "Powodzenia na egzaminie!";
					case "instructor":
						return "Wszystko gotowe";
					case "other":
						return "Założenia kursu spełnione";
				}
			case "complete_content":
				switch (role) {
					case "student":
						return "Ukończyłeś/aś wszystkie kroki w tym kursie i jesteś gotowy/a na egzamin państwowy. Już po egzaminie? Wypełnij ankietę.";
					case "instructor":
						return "Wszystkie kroki zostały ukończone. Nie zapomnij pożyczyć powodzenia 😉";
					case "other":
						return "Kursant opanował umiejętności wymagane do kierowania pojazdem oraz zdał egzamin wewnętrzny.";
				}

			case "examSoftBlock_title":
				switch (role) {
					case "student":
						return "Jeszcze nie dostępny";
					case "other":
					case "instructor":
						return "Jeszcze nie wskazany";
				}
			case "examSoftBlock_content":
				switch (role) {
					case "student":
						return "Przed Tobą jeszcze trochę ćwiczeń, nim będziesz gotowa/-y na egzamin.";
					case "instructor":
						return "Egzamin nie jest zalecany, ponieważ nie wszystkie umiejętności zostały jeszcze opanowane. Mimo to, możesz zaplanować egzamin.";
					case "other":
						return "Kursant nie opanował jeszcze wszystkich umiejętności.";
				}
			case "plannedExam_title":
				return "Egzamin zaplanowany";
			case "plannedExam_content":
				return `Egzamin został zaplanowany na ${params[0]}`;

			case "ongoingExam_title":
				return "Egzamin w trakcie";
			case "ongoingExam_content":
				return "Właśnie trwa egzamin wewnętrzny.";
			case "plannedExam_alt_title":
				return "Zaplanowany egzamin";
			case "plannedExam_future_content":
				switch (role) {
					case "student":
						return `Masz zaplanowany egzamin - ${params[0]}.`;
					default:
						return `Następna zaplanowana jazda (egzamin) - ${params[0]}.`;
				}
			case "plannedExam_start_now_content":
				switch (role) {
					case "student":
						return "Czas na Twój egzamin. Powodzenia!";
					case "instructor":
						return "Czas na zaplanowany egzamin. Rozpocznij go klikając w przycisk obok.";
					default:
						return "Zaplanowany egzamin powinien odbyć się lada chwila.";
				}
			case "plannedExam_past_content":
				switch (role) {
					case "student":
						return `Miałeś/aś zaplanowany egzamin (${params[0]}), lecz się on nie odbył (a przynajmniej my nic o tym nie wiemy).`;
					case "instructor":
						return `Ostatni zaplanowany egzamin (${params[0]}) nie odbył się. Anuluj go przyciskiem obok.`;
					default:
						return `Ostatni zaplanowany egzamin (${params[0]}) nie odbył się.`;
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
