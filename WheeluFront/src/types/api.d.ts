import { App } from "./app";

export namespace API {
	namespace _ {
        type TCommonServerErrorCodes = "InternalError" | "BadRequest" | "ServerUnavailable" | "MalformedResponse" | "Unauthorized" | "DbError";

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
			requestData: Record<string, string | number | string[] | object[] | undefined> | null
            urlParams: Record<string, string | number> | null
			error: IError<TCommonServerErrorCodes | string>
        }

        type IBuildAPIEndpoint<
				M extends "GET" | "POST" | "PUT" | "DELETE", 
				U extends string, 
				R, 
				E extends string = TCommonServerErrorCodes, 
				D extends Record<string, string | number | string[] | object[] | undefined> | null = null,
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

		namespace Get {
			interface IParams extends Record<string, string> {
				id: string
			}

			type IResponse = App.Models.IApplication;

			type IEndpoint = _.IBuildAPIEndpoint<"GET", "/api/v1/applications/:id", IResponse, _.TCommonServerErrorCodes, null, IParams>
		}

		namespace GetAll {
			type IResponse = _.IPaginatedResponse<App.Models.IApplication>

			type IEndpoint = _.IBuildAPIEndpoint<"GET","/api/v1/applications",IResponse, _.TCommonServerErrorCodes, Partial<_.IPagingRequest>>
		}

		type ResolveErrorCodes = "ApplicationNotFound" | "ApplicationResolved" | "MailServiceProblem" | "DbError" | _.TCommonServerErrorCodes;

		namespace Accept {
			type NearbyCityDef = {
				Id?: string
				Name?: string
				State: string
			}

			interface IRequestData extends Record<string, string | NearbyCityDef[]> {
				SchoolName: string
				Nip: string
				OwnerName: string
				OwnerSurname: string
				OwnerBirthday: string
				EstablishedDate: string
				Street: string
				BuildingNumber: string
				SubBuildingNumber: string
				ZipCode: string
				City: string
				State: string
				NearbyCities: NearbyCityDef[]
				Email: string
				PhoneNumber: string
			}

			interface IParams extends Record<string, string> {
				id: string
			}

			type IEndpoint = _.IBuildAPIEndpoint<"POST","/api/v1/applications/:id", null, ResolveErrorCodes, IRequestData, IParams>
		}

		namespace Reject {
			interface IRequestData extends Record<string, string | undefined> {
				Reason: App.Models.ApplicationRejectionReason
				Message?: string | undefined
			}

			interface IParams extends Record<string, string> {
				id: string
			}

			type IEndpoint = _.IBuildAPIEndpoint<"DELETE", "/api/v1/applications/:id",null, ResolveErrorCodes, IRequestData, IParams>
		}
	}
}