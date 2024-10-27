import { ExamCriteriumState, ExamState } from "../modules/enums";

export class ExamService {
	public static readonly criteriumStateColorMapping = {
		[ExamCriteriumState.FailedOnce]: "warning",
		[ExamCriteriumState.FailedTwice]: "error",
		[ExamCriteriumState.Passed]: "success",
	} as const;

	public static getExamListAccentColorFromState(state: ExamState) {
		switch (state) {
			case ExamState.Canceled:
			case ExamState.Planned:
				return "disabled";
			case ExamState.Ongoing:
				return "info";
			case ExamState.Failed:
				return "primary";
			case ExamState.Passed:
				return "success";
		}
	}

	public static formatExamState(status: ExamState) {
		switch (status) {
			case ExamState.Canceled:
				return "Odwołany";
			case ExamState.Planned:
				return "Zaplanowany";
			case ExamState.Ongoing:
				return "W trakcie";
			case ExamState.Failed:
				return "Negatywny";
			case ExamState.Passed:
				return "Pozytywny";
		}
	}

	public static formatCriteriaGroup(id: string) {
		switch (id) {
			case "maneuverCriteria":
				return "Plac manewrowy / ruch drogowy";
			case "drivingCriteria":
				return "Ruch drogowy";
		}
	}

	public static formatCriteriumItem(id: App.Models.ExamResult.CriteriaTypes) {
		switch (id) {
			case "preparingVehicle":
				return "1. Przygotowanie do jazdy";
			case "drivingStraight":
				return "2. Ruszanie z miejsca";
			case "diagonalParking":
				return "3. Parkowanie skośne";
			case "perpendicularParking":
				return "4. Parkowanie prostopadłe";
			case "parallelParking":
				return "5. Parkowanie równoległe";
			case "startingUpHill":
				return "6. Ruszanie z miejsca do przodu na wzniesieniu";
			case "slowSlalom":
				return "7. Slalom wolny";
			case "fastSlalom":
				return "8. Slalom szybki";
			case "obstacleBypassing":
				return "9. Ominięcie przeszkody";
			case "eightCurve":
				return "10. Jazda po łukach w kształcie cyfry 8";
			case "joiningTraffic":
				return "1. Włączanie się do ruchu";
			case "driving2Way1Road":
				return "2. Jazda drogami dwukierunkowymi jednojezdniowymi";
			case "driving2Way2Road":
				return "3. Jazda drogami dwukierunkowymi dwujezdniowymi";
			case "driving1Way":
				return "4. Jazda drogami jednokierunkowymi";
			case "equalJunction":
				return "5. Przejazd przez skrzyżowania równorzędne";
			case "signedJunction":
				return "6. Przejazd przez skrzyżowania oznakowane znakami ustalającymi pierwszeństwo przejazdu";
			case "lightedJunction":
				return "7. Przejazd przez skrzyżowania z sygnalizacją świetlną";
			case "roundaboutJunction":
				return "8. Przejazd przez skrzyżowania, na których ruch odbywa się wokół wyspy";
			case "twoLevelJunction":
				return "9. Przejazd przez skrzyżowania dwupoziomowe";
			case "drivingThroughCrossing":
				return "10. Przejazd przez przejścia dla pieszych";
			case "turningAround":
				return "12. Zawracanie";
			case "tramOrTrainTracksCrossing":
				return "13. Przejazd przez torowisko tramwajowe i kolejowe";
			case "tunnelDriving":
				return "14. Przejazd przez tunel";
			case "drivingNearPublicTransportStop":
				return "15. Przejazd obok przystanku tramwajowego i autobusowego";
			case "overtaking":
				return "16. Wyprzedzanie";
			case "bypassing":
				return "17. Omijanie";
			case "passingBy":
				return "18. Wymijanie";
			case "laneChanging":
				return "19. Zmiana pasa ruchu";
			case "turningRight":
				return "20. Zmiana kierunku ruchu w prawo";
			case "turningLeft":
				return "21. Zmiana kierunku ruchu w lewo";
			case "turningAroundOnJunction":
				return "22. Zawracanie na skrzyżowaniu";
			case "stoppingAtDestination":
				return "23. Hamowanie do zatrzymania we wskazanym miejscu";
			case "emergencyStop":
				return "24. Hamowanie awaryjne";
			case "uncoupling":
				return "25. Rozprzęganie";
			case "gearShifting":
				return "26. Właściwa zmiana biegów - jazda energooszczędna";
			case "engineBraking":
				return "27. Hamowanie silnikiem przy zatrzymaniu i zwalnianiu - jazda energooszczędna";
			case "drivingOverSpeedLimit":
				return "28. Przekroczenie dopuszczalnej prędkości";
			case "horizontalSignObeying":
				return "29. Zachowanie w odniesieniu do znaków poziomych";
			case "verticalSignObeying":
				return "30. Zachowanie w odniesieniu do znaków pionowych";
			case "lightSignObeying":
				return "31. Zachowanie w odniesieniu do sygnałów świetlnych";
			case "personSignObeying":
				return "32. Zachowanie w odniesieniu do poleceń osoby kierującej ruchem";
			case "behaviorTowardsOthers":
				return "33. Zachowanie w odniesieniu do innych uczestników ruchu";
			case "overallDriving":
				return "34. Respektowanie zasad techniki kierowania pojazdami";
		}
	}
}
