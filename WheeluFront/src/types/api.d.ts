import { App } from "./app";

export namespace API {
	namespace _ {
        type TCommonServerErrorCodes = "InternalError" | "BadRequest" | "ServerUnavailable" | "MalformedResponse" | "Unauthorized";

        interface ISuccessGetResponse<T> {
            state: true,
            data: T
        }

        interface IFailureGetResponse<T> {
            state: false,
            message?: string
            code: T
        }

        interface IBaseAPIEndpoint {
            method: "GET" | "POST" | "PUT" | "DELETE"
            url: string
            returnData: any
            errCodes: TCommonServerErrorCodes | string
            returnPacket: ISuccessGetResponse<this["returnData"]> | IFailureGetResponse<this["errCodes"]>
			requestData: Record<string, string  | number | undefined> | null
            urlParams: Record<string, string | number> | null
			error: IError<TCommonServerErrorCodes | string>
        }

        type IBuildAPIEndpoint<
				M extends "GET" | "POST" | "PUT" | "DELETE", 
				U extends string, 
				R, 
				E extends string = TCommonServerErrorCodes, 
				D extends Record<string, string | number> | null = null,
				P extends Record<string, string | number> | null = null> = {
            method: M
            url: U
            returnData: R
            errCodes: TCommonServerErrorCodes | E
            returnPacket: ISuccessGetResponse<R> | IFailureGetResponse<TCommonServerErrorCodes | E>
            urlParams: P
			requestData: D
			error: IError<TCommonServerErrorCodes | E>
        }

		interface IError<T> extends AxiosError {
			status?: number
			code: T
			message?: string
		}

		interface IPagingRequest extends Record<string, number> {
			PageNumber: number
			PagingSize?: number
		}

		type IPaginatedResponse<T> = {
			entries: T[]
			totalCount: number
			pageSize: number
			pagesCount: number
		}
    }

	namespace UserData {
		
		type IResponseData = App.Models.IUser;

		type IEndpoint = _.IBuildAPIEndpoint<"GET","/api/v1/auth/identify",IResponseData>
	}

	namespace Auth {
		namespace SignUp {
			interface IRequestData extends Record<string, string> {
				Username: string
				Password: string
				Name: string
				Surname: string
			}

			type IEndpoint = _.IBuildAPIEndpoint<"POST", "/api/v1/auth/signup", null, "PasswordRequirementsNotMet" | "EmailAlreadyTaken" | "EmailDeliveryProblem", IRequestData>
		}

		namespace SignIn {
			interface IRequestData extends Record<string, string> {
				Username: string
				Password: string
				RememberMe: string
			}

			interface IResponse {
				token: string
			}

			type IEndpoint = _.IBuildAPIEndpoint<"POST", "/api/v1/auth/signin", IResponse, "InvalidCredentials" | "AccountNotActivated", IRequestData>
		}

		namespace ResendActivation {
			interface IRequestData extends Record<string, string> {
				Email: string
			}

			type IEndpoint = _.IBuildAPIEndpoint<"POST", "/api/v1/auth/resend-activation", null, _.TCommonServerErrorCodes, IRequestData>	
		}

		namespace ActivateAccount {
			interface IRequestData extends Record<string, string> {
				Token: string
			}

			type IEndpoint = _.IBuildAPIEndpoint<"POST", "/api/v1/auth/activate-account", null, _.TCommonServerErrorCodes, IRequestData>
		}
	}

	namespace City {
		namespace GetAll {
			type IResponse = App.Models.ICity[]

			type IEndpoint = _.IBuildAPIEndpoint<"GET", "/api/v1/cities", IResponse>;
		}
	}

	namespace State {
		namespace GetAll {
			type IResponse = App.Models.IState[]

			type IEndpoint = _.IBuildAPIEndpoint<"GET", "/api/v1/states", IResponse>;
		}
	}

	namespace Application {

		namespace PostNew {

			interface IRequestData extends App.Models.IApplication, Record<string, string> {}

			type IEndpoint = _.IBuildAPIEndpoint<"POST","/api/v1/applications", null, "ApplicationAlreadyFiled" | "SchoolExists" | "RejectedTooSoon", IRequestData>
		}

		namespace GetAll {
			type IResponse = _.IPaginatedResponse<App.Models.IApplication>

			type IEndpoint = _.IBuildAPIEndpoint<"GET","/api/v1/applications",IResponse, _.TCommonServerErrorCodes, Partial<_.IPagingRequest>>
		}

		namespace Reject {
			interface IRequestData extends Record<string, string> {
				Reason: "unspecified" | "invalidData" | "platformSaturated" | "badReputation"
				Message?: string
			}

			interface IParams extends Record<string, string> {
				id: string
			}

			type IEndpoint = _.IBuildAPIEndpoint<"DELETE", "/api/v1/applications/:id",null, "ApplicationNotFound" | "ApplicationResolved" | "MailServiceProblem" | "DbError", IRequestData, IParams>
		}
	}
}