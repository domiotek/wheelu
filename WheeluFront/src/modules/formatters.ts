import { DateTime } from "luxon";
import { App } from "../types/app";

export const CurrencyFormatter = new Intl.NumberFormat("pl-PL", {
	style: "currency",
	currency: "PLN",
});

export const RoleFormatter = {
	format: (role?: App.Models.UserRole) => {
		switch (role) {
			case "Administrator":
				return "Administrator";
			case "SchoolManager":
				return "Właściciel szkoły";
			case "Student":
				return "Kursant";
			case "Instructor":
				return "Instruktor";
			default:
				return "";
		}
	},
};

export const DateTimeFormatter = {
	format: (isoDate?: string, format: string = "dd/LL/yyyy H:mm") => {
		if (!isoDate) return "";

		const dateTime = DateTime.fromISO(isoDate);

		if (!dateTime.isValid) return "(nieznana data)";

		return dateTime.toFormat(format);
	},

	formatAdaptiveFriendly: (iso: string | DateTime) => {
		const time = DateTime.isDateTime(iso) ? iso : DateTime.fromISO(iso);
		const today = DateTime.now();

		return time.toFormat(
			`EEEE, dd${time.month != today.month ? "/LL" : ""}${
				time.year != today.year ? "/yyyy" : ""
			}`
		);
	},
};
