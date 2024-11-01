import axios, { AxiosError } from "axios";
import { API } from "../types/api";
import { FieldError } from "react-hook-form";
import { DateTime } from "luxon";

const API_SERVER_HOST = "localhost:9090";

export function callAPI<T extends API._.IBaseAPIEndpoint>(
	method: T["method"],
	endpointURL: T["url"],
	requestData?: T["requestData"],
	urlParams?: T["urlParams"],
	optimisticTokenCheck: boolean = false
) {
	const printAPIFailure = (endpoint: string, reason: string) =>
		console.error(`[API] Call to '${endpoint}' failed. Reason: ${reason}`);

	return new Promise<T["returnData"]>((res, rej) => {
		const token = localStorage.getItem("token");

		if (!optimisticTokenCheck && token == null) {
			rej(new AxiosError("Not signed in", "Unauthorized"));
			printAPIFailure(endpointURL, "Unauthorized");
			return;
		}

		if (urlParams) {
			for (const paramName in urlParams) {
				const value = urlParams[paramName];
				endpointURL = endpointURL.replace(
					":" + paramName,
					value.toString() ?? ""
				);
			}
		}

		axios
			.request({
				method,
				url: `https://${API_SERVER_HOST}${endpointURL}`,
				headers: {
					Authorization: token ? `Bearer ${token}` : undefined,
				},
				params: method == "GET" ? requestData : undefined,
				data: method != "GET" ? requestData : undefined,
			})
			.then((response) => {
				res(response.data);
			})
			.catch((error: AxiosError<T["returnPacket"]>) => {
				let errCode: T["errCodes"];

				const serverErrorData = error.response?.data as
					| API._.IFailureResponse<T["errCodes"]>
					| undefined;

				switch (true) {
					case error.code == "ERR_NETWORK":
						errCode = "ServerUnavailable";
						break;
					case error.response?.status == 401 &&
						serverErrorData?.code != "InvalidCredentials":
						errCode = "Unauthorized";
						break;
					case error.response?.status == 403:
						errCode = "AccessDenied";
						break;
					case error.response?.status === 404 &&
						serverErrorData?.code == undefined:
						errCode = "EntityNotFound";
						break;
					case typeof serverErrorData == "object":
						errCode = serverErrorData.code;
						(error as any as API._.IError<T["errCodes"]>).details =
							serverErrorData!.details;
						break;
					default:
						errCode = "InternalError";
				}

				printAPIFailure(endpointURL, errCode);
				error.code = errCode;
				error.status = error.response?.status;
				rej(error);
			});
	});
}

/**
 * Resolves local file blob into it's content.
 * @param file Blob. Can be acquired for example via file input or throught drag&drop action.
 */
export function fetchLocalFile(file: File) {
	return new Promise<{ file: File; content: any }>((res) => {
		const reader = new FileReader();

		reader.onload = (ev) => {
			res({ file, content: ev.target?.result });
		};

		reader.readAsDataURL(file);
	});
}

function resolveClasses(
	classes: string | [string, boolean] | (string | [string, boolean])[]
): string {
	if (typeof classes == "string") return classes;

	if (Array.isArray(classes)) {
		if (classes.length == 2) {
			if (
				typeof classes[0] == "string" &&
				typeof classes[1] == "boolean"
			) {
				if (classes[1]) return classes[0];
			}
		}

		const committed = [];
		for (const item of classes) {
			if (!Array.isArray(item)) committed.push(item);
			else if (item[1]) committed.push(item[0]);
		}
		return committed.join(" ");
	}

	throw new Error("Unexpected value for resolveClasses");
}

export { resolveClasses as c };

export function OutsideContextNotifier() {
	console.error(
		"Tried to access context member outside of the context provider."
	);
}

/**
 * Processes form data from given form element and given static data.
 * @param form All html elements with the name attribute present inside the form will be processed.
 * @param ignoreList List of inputs that will be ignored and won't be present in the final form data.
 * @param staticFields Static data, that needs to be passed into endpoint but it's not present on the form.
 */
export function processFormData(
	form: HTMLFormElement,
	ignoreList?: string[],
	staticFields?: Record<string, string>
) {
	const formData: Record<string, string> = {};

	for (const element of form.elements) {
		const name = element.getAttribute("name");
		if (name && !ignoreList?.includes(name))
			formData[name] = (element as HTMLInputElement).value;
	}

	for (const name in staticFields) {
		if (!ignoreList?.includes(name)) formData[name] = staticFields[name];
	}

	return formData;
}

interface IFieldErrorContext {
	pattern: string;
	minLength: string;
	maxLength: string;
	min: number;
	max: number;
}

export function prepareFieldErrorMessage(
	error: FieldError | undefined,
	context?: Partial<IFieldErrorContext>
) {
	switch (error?.type) {
		case "required":
			return "To pole jest wymagane.";
		case "pattern":
			return context?.pattern ?? "Niewłaściwy format.";
		case "minLength":
			return context?.minLength
				? `Wprowadź przynajmniej ${context.minLength}.`
				: "Wprowadzony tekst jest za krótki.";
		case "maxLength":
			return context?.maxLength
				? `Wprowadź maksymalnie ${context.maxLength}.`
				: "Wprowardzony tekst jest za długi.";
		case "min":
			return context?.min
				? `Wartość nie może być mniejsza niż ${context.min}.`
				: "Wprowadzona wartość jest za mała.";
		case "max":
			return context?.max
				? `Wartość nie może być większa niż ${context.max}.`
				: "Wprowadzona wartość jest za duża.";
	}
}

export function translateGenericErrorCodes(
	error: API._.TCommonServerErrorCodes
) {
	switch (error) {
		case "BadRequest":
			return "Wystąpił problem z tym żądaniem.";
		case "DbError":
			return "Wystąpiły nieoczekiwane problemy z naszymi systemami.";
		case "ServerUnavailable":
			return "Serwer jest obecnie niedostępny, sprawdź połączenie z internetem.";
		case "Unauthorized":
			return "Twoja sesja wygasła. Odśwież stronę i zaloguj się ponownie.";
		case "AccessDenied":
			return "Nie masz wystarczających uprawnień, aby wykonać tę akcję, lub wyświetlić te dane.";
		case "EntityNotFound":
			return "Nie znaleziono żądanego obiektu.";
	}
}

export function formatAddress(address: App.Models.IAddress) {
	return `${address.street} ${address.buildingNumber}${
		address.subBuildingNumber ?? 0 > 0
			? `/${address.subBuildingNumber}`
			: ""
	}, ${address.zipCode} ${address.city} (${address.state})`;
}

export function popUrlSegment(url: string): string {
	return url.split("/").slice(0, -1).join("/");
}

/**
 * Returns suffix based on provided item count based on following rules:
 * * if count = 1, then suffix0
 * * if count = 2 || 3 || 4, then suffix1
 * * suffix2 for other cases.
 * @param count
 * @param suffixTable
 * @returns
 */
export function formatPolishWordSuffix(
	count: number,
	[suffix0, suffix1, suffix2]: string[]
) {
	const lastDigit = Math.abs(count) % 10;

	switch (true) {
		case count === 1:
			return suffix0;
		case lastDigit == 2 || lastDigit == 3 || lastDigit == 4:
			return suffix1;
		default:
			return suffix2;
	}
}

export function roundMinutesToQuarters(date: DateTime) {
	const quarter = Math.round(date.minute / 60 / 0.25) * 0.25;

	return date.set({
		hour: date.hour,
		minute: 60 * quarter,
		second: date.second,
	});
}
