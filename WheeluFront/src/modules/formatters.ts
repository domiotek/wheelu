import { DateTime } from "luxon";
import { CourseCategory } from "./enums";
import { CourseCategoriesMapping } from "./constants";

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

type RelativeTimeFormatUnit = Exclude<
	Intl.RelativeTimeFormatUnit,
	| "year"
	| "years"
	| "quarter"
	| "quarters"
	| "month"
	| "week"
	| "day"
	| "hour"
	| "minute"
	| "second"
>;

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

	formatRelativeDiff: (
		isoDate: string | undefined,
		allowedUnits: RelativeTimeFormatUnit[],
		base?: string
	) => {
		if (!isoDate) return "";
		const dateTime = DateTime.fromISO(isoDate);
		const baseDateTime = DateTime.fromISO(base ?? "");

		const diffPoint = baseDateTime.isValid ? baseDateTime : DateTime.now();

		const diffInSeconds = dateTime.diff(diffPoint, "seconds").seconds;

		const rtf = new Intl.RelativeTimeFormat("pl", { numeric: "auto" });

		let output = "";

		const diffInMonths = dateTime.diff(diffPoint, "months").months;
		if (Math.abs(diffInMonths) < 12 && allowedUnits.includes("months")) {
			output = rtf.format(Math.round(diffInMonths), "months");
		}

		const diffInDays = dateTime.diff(diffPoint, "days").days;
		if (Math.abs(diffInDays) < 30 && allowedUnits.includes("days")) {
			output = rtf.format(Math.round(diffInDays), "days");
		}

		const diffInHours = dateTime.diff(diffPoint, "hours").hours;
		if (Math.abs(diffInHours) < 24 && allowedUnits.includes("hours")) {
			output = rtf.format(Math.round(diffInHours), "hours");
		}

		const diffInMinutes = dateTime.diff(diffPoint, "minutes").minutes;
		if (Math.abs(diffInMinutes) < 60 && allowedUnits.includes("minutes")) {
			output = rtf.format(Math.round(diffInMinutes), "minutes");
		}

		if (Math.abs(diffInSeconds) < 60 && allowedUnits.includes("seconds")) {
			output = rtf.format(Math.round(diffInSeconds), "seconds");
		}

		return output;
	},
};

export const CourseCategoryFormatter = {
	format: (category: CourseCategory) => {
		return CourseCategoriesMapping[category].name;
	},
};
