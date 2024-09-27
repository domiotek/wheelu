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
