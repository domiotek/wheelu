export default class CourseService {
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
}
