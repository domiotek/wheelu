import { App } from "../types/app";

export default class TransactionService {
	public static translateTransactionStatus(
		state: App.Models.IShortTransaction["state"]
	): string {
		switch (state) {
			case "Complete":
				return "Zrealizowana";
			case "Registered":
				return "Oczekująca";
			case "Canceled":
				return "Anulowana";
			case "Refund":
				return "Zwrócona";
		}
	}
}
