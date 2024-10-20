import {
	AuthorizabledAccountActions,
	CourseCategory,
	RequestStatus,
	RideStatus,
	SortingType,
} from "../modules/enums";
import { App } from "./app";

export namespace API {
	namespace _ {
		type TCommonServerErrorCodes =
			| "BadRequest"
			| "ServerUnavailable"
			| "Unauthorized"
			| "AccessDenied"
			| "DbError"
			| "EntityNotFound";

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

		type BaseError = import("axios").AxiosError;

		interface IError<T> extends BaseError {
			code: T;
			details: string[];
		}

		interface IPagingRequest extends Record<string, any> {
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

		namespace Get {
			type IResponse = App.Models.IUser;

			interface IParams extends Record<string, string> {
				userID: string;
			}

			type IEndpoint = _.IBuildAPIEndpoint<
				"GET",
				"/api/v1/auth/users/:userID",
				IResponse,
				_.TCommonServerErrorCodes,
				null,
				IParams
			>;
		}

		namespace AuthAction {
			interface IResponse {
				token: string;
			}

			interface IRequest extends Record<string, number> {
				action: AuthorizabledAccountActions;
			}

			type IEndpoint = _.IBuildAPIEndpoint<
				"POST",
				"/api/v1/auth/auth-user-action",
				IResponse,
				_.TCommonServerErrorCodes,
				IRequest
			>;
		}

		namespace Update {
			type IRequest = Partial<
				Record<App.UI.AccountProfile.TAccountPropertyKey, string>
			>;

			interface IParams extends Record<string, string> {
				userID: string;
			}

			type IEndpoint = _.IBuildAPIEndpoint<
				"PUT",
				"/api/v1/auth/users/:userID",
				null,
				_.TCommonServerErrorCodes,
				IRequest,
				IParams
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

		namespace Search {
			type IResponse = _.IPaginatedResponse<App.Models.ISchool>;

			interface IRequest
				extends _.IPagingRequest,
					Record<string, string | number> {
				query?: string;
				SortingTarget: number;
				SortingType: SortingType;
			}

			type IEndpoint = _.IBuildAPIEndpoint<
				"GET",
				"/api/v1/schools/search",
				IResponse,
				_.TCommonServerErrorCodes,
				IRequest
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

			namespace Search {
				type IResponse =
					_.IPaginatedResponse<App.Models.ISearchCourseOffer>;

				interface IRequest
					extends _.IPagingRequest,
						Record<string, string | number> {
					CategoryType?: CourseCategory;
					SortingTarget: number;
					SortingType: SortingType;
				}

				type IEndpoint = _.IBuildAPIEndpoint<
					"GET",
					"/api/v1/offers/search",
					IResponse,
					_.TCommonServerErrorCodes,
					IRequest
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
					| "MailServiceProblem"
					| "InvalidAccountType"
					| "AlreadyEmployed",
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

		interface IActionParams extends IParams {
			instructorID: number;
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

		namespace Get {
			type IResponse = App.Models.IEmployedInstructor;

			type IEndpoint = _.IBuildAPIEndpoint<
				"GET",
				"/api/v1/schools/:schoolID/instructors/:instructorID",
				IResponse,
				_.TCommonServerErrorCodes,
				null,
				IActionParams
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

		namespace Update {
			interface IInstructorProperties {
				maximumConcurrentStudents: number;
			}

			interface IRequest extends Record<string, string | bool | array> {
				visibilityState?: boolean;
				properties?: IInstructorProperties;
				allowedCategories?: CourseCategory[];
			}

			type IEndpoint = _.IBuildAPIEndpoint<
				"PUT",
				"/api/v1/schools/:schoolID/instructors/:instructorID",
				null,
				_.TCommonServerErrorCodes,
				IRequest,
				IActionParams
			>;
		}

		namespace Detach {
			type IEndpoint = _.IBuildAPIEndpoint<
				"DELETE",
				"/api/v1/schools/:schoolID/instructors/:instructorID",
				null,
				"AlreadyDetached" | "InstructorVisible" | "EntityNotFound",
				null,
				IActionParams
			>;
		}

		namespace GetProfile {
			type IResponse = App.Models.IInstructorProfile;

			interface IParams extends Record<string, number> {
				instructorID: number;
			}

			type IEndpoint = _.IBuildAPIEndpoint<
				"GET",
				"/api/v1/instructors/:instructorID",
				IResponse,
				_.TCommonServerErrorCodes,
				null,
				IParams
			>;
		}
	}

	namespace Vehicles {
		interface IParams extends Record<string, number> {
			schoolID: number;
		}

		interface IExtendedParams extends IParams {
			vehicleID: number;
		}

		namespace GetOne {
			interface IParams extends Record<string, number> {
				schoolID: number;
				vehicleID: number;
			}

			type IResponse = App.Models.IVehicle;

			type IEndpoint = _.IBuildAPIEndpoint<
				"GET",
				"/api/v1/schools/:schoolID/vehicles/:vehicleID",
				IResponse,
				_.TCommonServerErrorCodes,
				null,
				IParams
			>;
		}

		namespace GetAllOfSchool {
			type IResponse = App.Models.IShortVehicle[];

			interface IRequest extends Record<string, string> {
				after?: string;
				before?: string;
			}

			type IEndpoint = _.IBuildAPIEndpoint<
				"GET",
				"/api/v1/schools/:schoolID/vehicles",
				IResponse,
				_.TCommonServerErrorCodes,
				IRequest,
				IParams
			>;
		}

		namespace CreateOrUpdate {
			type IEndpoint = _.IBuildAPIEndpoint<
				"POST" | "PUT",
				`/api/v1/schools/:schoolID/vehicles${"" | "/:vehicleID"}`,
				null,
				"InvalidImage",
				any,
				IExtendedParams
			>;
		}

		namespace Delete {
			type IEndpoint = _.IBuildAPIEndpoint<
				"DELETE",
				`/api/v1/schools/:schoolID/vehicles/:vehicleID`,
				null,
				_.TCommonServerErrorCodes,
				null,
				IExtendedParams
			>;
		}
	}

	namespace Courses {
		interface IBaseParams extends Record<string, number> {
			schoolID: number;
		}

		namespace Get {
			type IResponse = App.Models.ICourse;

			interface IParams extends Record<string, number> {
				courseID: number;
			}

			type IEndpoint = _.IBuildAPIEndpoint<
				"GET",
				"/api/v1/courses/:courseID",
				IResponse,
				_.TCommonServerErrorCodes,
				null,
				IParams
			>;
		}

		namespace GetManyOfSchool {
			type IResponse = _.IPaginatedResponse<App.Models.ILimitedCourse>;

			type IEndpoint = _.IBuildAPIEndpoint<
				"GET",
				"/api/v1/schools/:schoolID/courses",
				IResponse,
				_.TCommonServerErrorCodes,
				Partial<_.IPagingRequest>,
				IBaseParams
			>;
		}

		namespace Buy {
			interface IParams extends Record<string, number> {
				offerID: number;
			}

			interface IRequest extends Record<string, number> {
				instructorID: number;
				totalAmount: number;
			}

			interface IResponse {
				paymentUrl: string;
			}

			type IEndpoint = _.IBuildAPIEndpoint<
				"POST",
				"/api/v1/offers/:offerID/purchase",
				IResponse,
				| "InstructorUnavailable"
				| "SchoolBlocked"
				| "TPayError"
				| "PriceMismatch",
				IRequest,
				IParams
			>;
		}

		interface ICourseBaseParams extends Record<string, number> {
			courseID: number;
		}

		namespace GetCourseRide {
			type IResponse = App.Models.IRide;

			interface IParams extends ICourseBaseParams {
				rideID: number;
			}

			type IEndpoint = _.IBuildAPIEndpoint<
				"GET",
				"/api/v1/courses/:courseID/rides/:rideID",
				IResponse,
				_.TCommonServerErrorCodes,
				null,
				IParams
			>;
		}

		namespace GetCourseRides {
			type IResponse = App.Models.IRide[];

			type IEndpoint = _.IBuildAPIEndpoint<
				"GET",
				"/api/v1/courses/:courseID/rides",
				IResponse,
				_.TCommonServerErrorCodes,
				null,
				ICourseBaseParams
			>;
		}

		namespace CreateRide {
			interface IRequest extends Record<string, number> {
				slotID: number;
				vehicleID: number;
			}

			type IEndpoint = _.IBuildAPIEndpoint<
				"POST",
				"/api/v1/courses/:courseID/rides",
				null,
				"RideAssigned" | "VehicleUnavailable" | "InsufficientHoursLeft",
				IRequest,
				ICourseBaseParams
			>;
		}

		namespace SetRideState {
			interface IRequest extends Record<string, number> {
				newStatus: RideStatus;
			}

			interface IParams extends ICourseBaseParams {
				rideID: number;
			}

			type IEndpoint = _.IBuildAPIEndpoint<
				"PUT",
				"/api/v1/courses/:courseID/rides/:rideID",
				null,
				"InvalidRideStatus",
				IRequest,
				IParams
			>;
		}

		namespace SetRideVehicle {
			interface IRequest extends Record<string, number> {
				newVehicleId: number;
			}

			interface IParams extends ICourseBaseParams {
				rideID: number;
			}

			type IEndpoint = _.IBuildAPIEndpoint<
				"PUT",
				"/api/v1/courses/:courseID/rides/:rideID/vehicle",
				null,
				"VehicleUnavailable" | "InvalidRideStatus",
				IRequest,
				IParams
			>;
		}

		namespace BuyHours {
			interface IRequest extends Record<string, number> {
				hoursCount: number;
				totalAmount: number;
			}

			interface IResponse {
				paymentUrl: string;
			}

			type IEndpoint = _.IBuildAPIEndpoint<
				"POST",
				"/api/v1/courses/:courseID/purchase-hours",
				IResponse,
				"TPayError" | "PriceMismatch",
				IRequest,
				ICourseBaseParams
			>;
		}

		namespace GetHoursPackages {
			type IResponse = App.Models.IHourPackage[];

			type IEndpoint = _.IBuildAPIEndpoint<
				"GET",
				"/api/v1/courses/:courseID/hours-packages",
				IResponse,
				_.TCommonServerErrorCodes,
				null,
				ICourseBaseParams
			>;
		}

		namespace ChangeInstructorRequest {
			namespace GetFromCourse {
				type IResponse = App.Models.IInstructorChangeRequest;

				type IEndpoint = _.IBuildAPIEndpoint<
					"GET",
					"/api/v1/courses/:courseID/instructor-change-request",
					IResponse,
					_.TCommonServerErrorCodes,
					null,
					ICourseBaseParams
				>;
			}

			namespace GetMany {
				type IResponse =
					_.IPaginatedResponse<App.Models.IInstructorChangeRequest>;

				interface IParams extends Record<string, number> {
					schoolID: number;
				}

				type IEndpoint = _.IBuildAPIEndpoint<
					"GET",
					"/api/v1/schools/:schoolID/instructor-change-requests",
					IResponse,
					_.TCommonServerErrorCodes,
					Partial<_.IPagingRequest>,
					IParams
				>;
			}

			namespace Post {
				interface IRequest
					extends Record<string, number | string | undefined> {
					instructorId?: number;
					note: string;
				}

				type IEndpoint = _.IBuildAPIEndpoint<
					"POST",
					"/api/v1/courses/:courseID/instructor-change-request",
					null,
					"ExternalInstructor" | "InstructorNotAllowed",
					IRequest,
					ICourseBaseParams
				>;
			}

			namespace PutStatus {
				interface IRequest extends Record<string, number> {
					newStatus: RequestStatus;
				}

				interface IParams extends Record<string, number> {
					schoolID: number;
					requestID: number;
				}

				type IEndpoint = _.IBuildAPIEndpoint<
					"PUT",
					"/api/v1/schools/:schoolID/instructor-change-requests/:requestID",
					null,
					"InvalidState",
					IRequest,
					IParams
				>;
			}

			namespace DeleteFromCourse {
				type IEndpoint = _.IBuildAPIEndpoint<
					"DELETE",
					"/api/v1/courses/:courseID/instructor-change-request",
					null,
					"InvalidState",
					null,
					ICourseBaseParams
				>;
			}
		}

		namespace ChangeInstructor {
			interface IRequest extends Record<string, number> {
				instructorId: number;
			}

			type IEndpoint = _.IBuildAPIEndpoint<
				"PUT",
				"/api/v1/courses/:courseID/instructor",
				null,
				| "ExternalInstructor"
				| "InstructorUnavailable"
				| "RidesPlanned"
				| "RideOngoing",
				IRequest,
				ICourseBaseParams
			>;
		}

		namespace UpdateProgress {
			interface IRequest extends Record<string, any> {
				progress: App.Models.ICourseProgress;
			}

			type IEndpoint = _.IBuildAPIEndpoint<
				"PUT",
				"/api/v1/courses/:courseID/progress",
				null,
				_.TCommonServerErrorCodes,
				IRequest,
				ICourseBaseParams
			>;
		}
	}

	namespace Transactions {
		interface IBaseParams extends Record<string, number> {
			schoolID: number;
		}

		namespace GetManyOfTarget {
			type IResponse = _.IPaginatedResponse<App.Models.IShortTransaction>;

			interface IRequestData
				extends Record<string, number | string | undefined> {
				schoolID?: number;
				userID?: string;
			}

			type IEndpoint = _.IBuildAPIEndpoint<
				"GET",
				"/api/v1/transactions",
				IResponse,
				"RideAssigned" | "VehicleUnavailable",
				Partial<_.IPagingRequest> & IRequestData,
				IBaseParams
			>;
		}
	}

	namespace Schedule {
		interface IBaseParams extends Record<string, number> {
			instructorID: number;
		}

		namespace GetSlotsOfInstructor {
			type IResponse = App.Models.IScheduleSlot[];

			interface IRequestData
				extends Record<string, number | string | undefined> {
				before?: string;
				after?: string;
			}

			type IEndpoint = _.IBuildAPIEndpoint<
				"GET",
				"/api/v1/instructors/:instructorID/schedule",
				IResponse,
				_.TCommonServerErrorCodes,
				IRequestData,
				IBaseParams
			>;
		}

		interface IManageSlotRequest extends Record<string, string> {
			startTime: string;
			endTime: string;
		}

		interface IManageParams extends IBaseParams {
			slotID: number;
		}

		type Errors =
			| "InstructorNotEmployed"
			| "SlotOverlap"
			| "InvalidDuration"
			| "InvalidSlotPlacement"
			| "RideAssigned";

		namespace CreateSlot {
			type IEndpoint = _.IBuildAPIEndpoint<
				"POST",
				"/api/v1/instructors/:instructorID/schedule",
				IResponse,
				| "InstructorNotEmployed"
				| "SlotOverlap"
				| "InvalidDuration"
				| "InvalidSlotPlacement",
				IManageSlotRequest,
				IBaseParams
			>;
		}

		namespace EditSlot {
			type IEndpoint = _.IBuildAPIEndpoint<
				"PUT",
				"/api/v1/instructors/:instructorID/schedule/:slotID",
				IResponse,
				| "InstructorNotEmployed"
				| "SlotOverlap"
				| "RideAssigned"
				| "InvalidDuration"
				| "InvalidSlotPlacement",
				IManageSlotRequest,
				IManageParams
			>;
		}

		namespace DeleteSlot {
			type IEndpoint = _.IBuildAPIEndpoint<
				"DELETE",
				"/api/v1/instructors/:instructorID/schedule/:slotID",
				IResponse,
				"InstructorNotEmployed" | "RideAssigned",
				IRequestData,
				IManageParams
			>;
		}
	}
}
