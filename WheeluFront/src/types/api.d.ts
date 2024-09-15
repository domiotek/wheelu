import { App } from "./app";

export namespace API {
	namespace _ {
		type TCommonServerErrorCodes =
			| "BadRequest"
			| "ServerUnavailable"
			| "Unauthorized"
			| "AccessDenied"
			| "DbError";

		interface IFailureResponse<T> {
			details: string[];
			code: T;
		}

		interface IBaseAPIEndpoint {
			method: "GET" | "POST" | "PUT" | "DELETE";
			url: string;
			returnData: any;
			errCodes: TCommonServerErrorCodes | string;
			returnPacket:
				| this["returnData"]
				| IFailureResponse<this["errCodes"]>;
			requestData: Record<
				string,
				string | number | string[] | object[] | undefined | boolean
			> | null;
			urlParams: Record<string, string | number> | null;
			error: IError<TCommonServerErrorCodes | string>;
		}

		type IBuildAPIEndpoint<
			M extends "GET" | "POST" | "PUT" | "DELETE",
			U extends string,
			R,
			E extends string = TCommonServerErrorCodes,
			D extends Record<
				string,
				string | number | string[] | object[] | undefined
			> | null = null,
			P extends Record<string, string | number> | null = null
		> = {
			method: M;
			url: U;
			returnData: R;
			errCodes: TCommonServerErrorCodes | E;
			returnPacket: R | IFailureResponse<TCommonServerErrorCodes | E>;
			urlParams: P;
			requestData: D;
			error: IError<TCommonServerErrorCodes | E>;
		};

		interface IError<T> extends AxiosError {
			code: T;
			details: string[];
		}

		interface IPagingRequest extends Record<string, number> {
			PageNumber: number;
			PagingSize?: number;
		}

		type IPaginatedResponse<T> = {
			entries: T[];
			totalCount: number;
			pageSize: number;
			pagesCount: number;
		};
	}

	namespace Auth {
		namespace Identify {
			type IResponseData = App.Models.IIdentityUser;

			type IEndpoint = _.IBuildAPIEndpoint<
				"GET",
				"/api/v1/auth/identify",
				IResponseData
			>;
		}

		namespace SignUp {
			interface IRequestData extends Record<string, string> {
				Username: string;
				Password: string;
				Name: string;
				Surname: string;
				Birthday: string;
			}

			type IEndpoint = _.IBuildAPIEndpoint<
				"POST",
				"/api/v1/auth/signup",
				null,
				| "PasswordRequirementsNotMet"
				| "EmailAlreadyTaken"
				| "EmailDeliveryProblem",
				IRequestData
			>;
		}

		namespace SignIn {
			interface IRequestData extends Record<string, string> {
				Username: string;
				Password: string;
				RememberMe: string;
			}

			interface IResponse {
				token: string;
			}

			type IEndpoint = _.IBuildAPIEndpoint<
				"POST",
				"/api/v1/auth/signin",
				IResponse,
				"InvalidCredentials" | "AccountNotActivated",
				IRequestData
			>;
		}

		namespace ResendActivation {
			interface IRequestData extends Record<string, string> {
				Email: string;
			}

			type IEndpoint = _.IBuildAPIEndpoint<
				"POST",
				"/api/v1/auth/resend-activation",
				null,
				_.TCommonServerErrorCodes,
				IRequestData
			>;
		}

		namespace ActivateAccount {
			interface IRequestData extends Record<string, string> {
				Token: string;
			}

			type IEndpoint = _.IBuildAPIEndpoint<
				"POST",
				"/api/v1/auth/activate-account",
				null,
				_.TCommonServerErrorCodes,
				IRequestData
			>;
		}

		namespace RecoverPassword {
			interface IRequestData extends Record<string, string> {
				Email: string;
			}

			type IEndpoint = _.IBuildAPIEndpoint<
				"POST",
				"/api/v1/auth/recover-account",
				null,
				_.TCommonServerErrorCodes,
				IRequestData
			>;
		}

		namespace ChangePassword {
			interface IRequestData extends Record<string, string> {
				Token: string;
				Password: string;
			}

			type IEndpoint = _.IBuildAPIEndpoint<
				"POST",
				"/api/v1/auth/change-password",
				null,
				"PasswordRequirementsNotMet",
				IRequestData
			>;
		}
	}

	namespace User {
		namespace GetMany {
			type IResponse = _.IPaginatedResponse<App.Models.IUser>;

			type IEndpoint = _.IBuildAPIEndpoint<
				"GET",
				"/api/v1/auth/users",
				IResponse,
				_.TCommonServerErrorCodes,
				Partial<_.IPagingRequest>
			>;
		}
	}

	namespace City {
		namespace GetAll {
			type IResponse = App.Models.ICity[];

			type IEndpoint = _.IBuildAPIEndpoint<
				"GET",
				"/api/v1/cities",
				IResponse
			>;
		}
	}

	namespace State {
		namespace GetAll {
			type IResponse = App.Models.IState[];

			type IEndpoint = _.IBuildAPIEndpoint<
				"GET",
				"/api/v1/states",
				IResponse
			>;
		}
	}

	namespace Application {
		namespace PostNew {
			interface IRequestData
				extends App.Models.IApplication,
					Record<string, string> {}

			type IEndpoint = _.IBuildAPIEndpoint<
				"POST",
				"/api/v1/applications",
				null,
				| "ApplicationAlreadyFiled"
				| "SchoolExists"
				| "RejectedTooSoon"
				| "UserExists",
				IRequestData
			>;
		}

		namespace Get {
			interface IParams extends Record<string, string> {
				id: string;
			}

			type IResponse = App.Models.IApplication;

			type IEndpoint = _.IBuildAPIEndpoint<
				"GET",
				"/api/v1/applications/:id",
				IResponse,
				_.TCommonServerErrorCodes,
				null,
				IParams
			>;
		}

		namespace GetAll {
			type IResponse = _.IPaginatedResponse<App.Models.IApplication>;

			type IEndpoint = _.IBuildAPIEndpoint<
				"GET",
				"/api/v1/applications",
				IResponse,
				_.TCommonServerErrorCodes,
				Partial<_.IPagingRequest>
			>;
		}

		type ResolveErrorCodes =
			| "ApplicationNotFound"
			| "ApplicationResolved"
			| "MailServiceProblem"
			| "DbError"
			| _.TCommonServerErrorCodes;

		namespace Accept {
			type NearbyCityDef = {
				Id?: string;
				Name?: string;
				State: string;
			};

			interface IRequestData
				extends Record<string, string | NearbyCityDef[]> {
				SchoolName: string;
				Nip: string;
				OwnerName: string;
				OwnerSurname: string;
				OwnerBirthday: string;
				EstablishedDate: string;
				Street: string;
				BuildingNumber: string;
				SubBuildingNumber: string;
				ZipCode: string;
				City: string;
				State: string;
				NearbyCities: NearbyCityDef[];
				Email: string;
				PhoneNumber: string;
			}

			interface IParams extends Record<string, string> {
				id: string;
			}

			type IEndpoint = _.IBuildAPIEndpoint<
				"POST",
				"/api/v1/applications/:id/accept",
				null,
				ResolveErrorCodes,
				IRequestData,
				IParams
			>;
		}

		namespace Reject {
			interface IRequestData extends Record<string, string | undefined> {
				Reason: App.Models.ApplicationRejectionReason;
				Message?: string | undefined;
			}

			interface IParams extends Record<string, string> {
				id: string;
			}

			type IEndpoint = _.IBuildAPIEndpoint<
				"POST",
				"/api/v1/applications/:id/reject",
				null,
				ResolveErrorCodes,
				IRequestData,
				IParams
			>;
		}

		namespace Delete {
			interface IParams extends Record<string, string> {
				id: string;
			}

			type IEndpoint = _.IBuildAPIEndpoint<
				"DELETE",
				"/api/v1/applications/:id",
				null,
				ResolveErrorCodes,
				IRequestData,
				IParams
			>;
		}
	}

	namespace School {
		namespace Get {
			interface IParams extends Record<string, string> {
				id: string;
			}

			type IResponse = App.Models.ISchool;

			type IEndpoint = _.IBuildAPIEndpoint<
				"GET",
				"/api/v1/schools/:id",
				IResponse,
				_.TCommonServerErrorCodes,
				null,
				IParams
			>;
		}

		namespace GetAll {
			type IResponse = _.IPaginatedResponse<App.Models.ISchool>;

			type IEndpoint = _.IBuildAPIEndpoint<
				"GET",
				"/api/v1/schools",
				IResponse,
				_.TCommonServerErrorCodes,
				Partial<_.IPagingRequest>
			>;
		}

		namespace Update {
			interface IRequestData
				extends Record<string, string>,
					App.Models.IAddress {
				name: string;
				nip: string;
				phoneNumber: string;
				description: string;
				nearbyCities: NearbyCityDef[];
			}

			interface IParams extends Record<string, string> {
				id: string;
			}

			type IEndpoint = _.IBuildAPIEndpoint<
				"PUT",
				"/api/v1/schools/:id",
				null,
				"SchoolNotFound" | "InvalidFile" | "AddressResolvingError",
				IRequestData,
				IParams
			>;
		}

		namespace SetVisibility {
			interface IRequestData extends Record<string, string | boolean> {
				state: boolean;
			}

			interface IParams extends Record<string, string> {
				id: string;
			}

			type IEndpoint = _.IBuildAPIEndpoint<
				"PUT",
				"/api/v1/schools/:id/visibility",
				null,
				"SchoolNotFound",
				IRequestData,
				IParams
			>;
		}

		namespace SetBlockade {
			interface IRequestData extends Record<string, string | boolean> {
				state: boolean;
			}

			interface IParams extends Record<string, string> {
				id: string;
			}

			type IEndpoint = _.IBuildAPIEndpoint<
				"PUT",
				"/api/v1/schools/:id/blockade",
				null,
				"SchoolNotFound",
				IRequestData,
				IParams
			>;
		}
	}

	namespace Offers {
		namespace Courses {
			namespace GetAllOfSchool {
				interface IRequestData extends Record<string, number> {
					schoolID: number;
				}

				type IResponse = _.IPaginatedResponse<App.Models.ICourseOffer>;

				type IEndpoint = _.IBuildAPIEndpoint<
					"GET",
					"/api/v1/offers",
					_.IPaginatedResponse<App.Models.ICourseOffer>,
					_.TCommonServerErrorCodes,
					IRequestData
				>;
			}

			namespace Create {
				interface IRequestData
					extends Record<string, string | number | boolean> {
					schoolID: number;
					category: number;
					enabled: boolean;
					hoursCount: number;
					price: number;
					pricePerHour: number;
				}

				type IEndpoint = _.IBuildAPIEndpoint<
					"POST",
					"/api/v1/offers",
					null,
					"SchoolNotFound" | "InvalidCategory",
					IRequestData
				>;
			}

			namespace Update {
				interface IRequestData
					extends Record<string, string | number | boolean> {
					enabled: boolean;
					hoursCount: number;
					price: number;
					pricePerHour: number;
				}

				interface IParams extends Record<string, number> {
					id: number;
				}

				type IEndpoint = _.IBuildAPIEndpoint<
					"PUT",
					"/api/v1/offers/:id",
					null,
					_.TCommonServerErrorCodes,
					IRequestData,
					IParams
				>;
			}

			namespace Delete {
				interface IParams extends Record<string, number> {
					id: number;
				}

				type IEndpoint = _.IBuildAPIEndpoint<
					"DELETE",
					"/api/v1/offers/:id",
					null,
					_.TCommonServerErrorCodes,
					null,
					IParams
				>;
			}
		}
	}

	namespace Instructors {
		interface IParams extends Record<string, number> {
			schoolID: number;
		}

		namespace Invities {
			interface IParams extends Record<string, number | string> {
				schoolID: number;
				tokenID: string;
			}

			type URL = "/api/v1/schools/:schoolID/instructors/invites/:tokenID";

			namespace GetAllOfSchool {
				type IResponse = App.Models.IInstructorInvite[];

				type IEndpoint = _.IBuildAPIEndpoint<
					"GET",
					"/api/v1/schools/:schoolID/instructors/invites",
					IResponse,
					_.TCommonServerErrorCodes,
					null,
					Instructors.IParams
				>;
			}

			namespace Get {
				interface IParams extends Record<string, string> {
					tokenID: string;
				}

				type IResponse = App.Models.IInstructorInvite;

				type IEndpoint = _.IBuildAPIEndpoint<
					"GET",
					"/api/v1/instructors/invites/:tokenID",
					IResponse,
					_.TCommonServerErrorCodes,
					null,
					IParams
				>;
			}

			namespace Resend {
				type IEndpoint = _.IBuildAPIEndpoint<
					"POST",
					URL,
					null,
					_.TCommonServerErrorCodes,
					null,
					IParams
				>;
			}

			namespace Renew {
				type IEndpoint = _.IBuildAPIEndpoint<
					"PUT",
					URL,
					null,
					_.TCommonServerErrorCodes,
					null,
					IParams
				>;
			}

			namespace Cancel {
				type IEndpoint = _.IBuildAPIEndpoint<
					"DELETE",
					URL,
					null,
					_.TCommonServerErrorCodes,
					null,
					IParams
				>;
			}
		}

		namespace GetAllOfSchool {
			type IResponse = App.Models.IEmployedInstructor[];

			type IEndpoint = _.IBuildAPIEndpoint<
				"GET",
				"/api/v1/schools/:schoolID/instructors",
				IResponse,
				_.TCommonServerErrorCodes,
				null,
				IParams
			>;
		}

		namespace SendInvite {
			interface IRequest extends Record<string, string> {
				email: string;
			}

			type IEndpoint = _.IBuildAPIEndpoint<
				"POST",
				"/api/v1/schools/:schoolID/instructors",
				null,
				"MailServiceProblem" | "InvalidAccountType" | "AlreadyEmployed",
				IRequest,
				IParams
			>;
		}

		namespace CreateAccount {
			interface IRequest extends Auth.SignUp.IRequestData {
				Token: string;
			}

			type IEndpoint = _.IBuildAPIEndpoint<
				"POST",
				"/api/v1/instructors",
				null,
				"InvalidToken" | "AccountCreationError" | "JoinSchoolError",
				IRequest
			>;
		}

		namespace ConnectProfile {
			interface IRequest extends Record<string, string> {
				Token: string;
			}

			type IEndpoint = _.IBuildAPIEndpoint<
				"POST",
				"/api/v1/instructors/join",
				null,
				"InvalidToken" | "UserNotFound" | "JoinSchoolError",
				IRequest
			>;
		}
	}
}
