import axios, { AxiosError } from "axios";
import { API } from "../types/api";

const API_SERVER_HOST = "localhost:9090";

export function callAPI<T extends API._.IBaseAPIEndpoint>(
	method: T["method"],
	endpointURL: T["url"],
	requestData?: T["requestData"],
	urlParams?: T["urlParams"],
	optimisticTokenCheck: boolean=false) {
		const printAPIFailure = (endpoint: string, reason: string)=>console.error(`[API] Call to '${endpoint}' failed. Reason: ${reason}`);


		return new Promise<T["returnData"]>((res, rej)=>{
			const token = localStorage.getItem("token");

			if(!optimisticTokenCheck&&token==null) {
				rej(new AxiosError("Not signed in", "Unauthorized"));
				return;
			}

			if(urlParams) {
				for (const paramName in urlParams) {
					const value = urlParams[paramName];
					endpointURL = endpointURL.replace(":"+paramName,value.toString() ?? "");
				}
			}

			axios.request({
				method,
				url: `https://${API_SERVER_HOST}${endpointURL}`,
				headers: {
					Authorization: token?`Bearer ${token}`:undefined
				},
				params: method=="GET"?requestData:undefined,
				data: method!="GET"?requestData:undefined
			}).then(response=>{
				res(response.data);
			}).catch((error: AxiosError<T["returnPacket"]>)=>{
				let errCode: T["errCodes"];

				const serverErrorData = error.response?.data as API._.IFailureGetResponse<T["errCodes"]> | undefined;
				
				switch(true) {
					case error.code=="ERR_NETWORK":
						errCode = "ServerUnavailable";
					break;
					case error.response?.status==401&&serverErrorData?.code!="InvalidCredentials":
						errCode = "Unauthorized";
					break;
					case serverErrorData!=undefined:
						errCode = serverErrorData.code;
						error.message = serverErrorData.message ?? error.message;
					break;
					default: 
						errCode = "InternalError";
						
				}

				printAPIFailure(endpointURL,errCode);
				error.code = errCode;
				rej(error);
			});
		});
}

export function resolveClasses(classes: string | (string | [string, boolean])[]): string {
	if(typeof classes=="string") return classes;

	if(Array.isArray(classes)) {
		const committed = [];
		for (const item of classes) {
			if(!Array.isArray(item)) committed.push(item);
			else if(item[1]) committed.push(item[0]);
		}
		return committed.join(" ");
	}

	throw new Error("Unexpected value for resolveClasses");
} 

export function OutsideContextNotifier(){
	console.error("Tried to access context member outside of the context provider.");
};


/**
 * Processes form data from given form element and given static data.
 * @param form All html elements with the name attribute present inside the form will be processed.
 * @param ignoreList List of inputs that will be ignored and won't be present in the final form data.
 * @param staticFields Static data, that needs to be passed into endpoint but it's not present on the form.
 */
export function processFormData(form: HTMLFormElement, ignoreList?: string[], staticFields?: Record<string, string>) {
	const formData: Record<string, string> = {};

	for (const element of form.elements) {
		const name = element.getAttribute("name");
		if(name&&!ignoreList?.includes(name))
			formData[name] = (element as HTMLInputElement).value;
	}

	for (const name in staticFields) {
		if(!ignoreList?.includes(name))
			formData[name] = staticFields[name];
	}

	return formData;
}