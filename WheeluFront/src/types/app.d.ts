import { Email } from "@mui/icons-material";
import {
	CourseCategory,
	RideStatus,
	TransmissionType,
	VehiclePartType,
} from "../modules/enums";
import AdminPanel from "../pages/AdminPanel/AdminPanel";
import { DateTime } from "luxon";
import { HTMLInputTypeAttribute } from "react";

export namespace App {
	namespace Models {
		type UserRole =
			| "Student"
			| "Administrator"
			| "SchoolManager"
			| "Instructor";

		interface IIdentityUser {
			userId: string;
			name: string;
			surname: string;
			role: UserRole;
			ownedSchool?: {
				id: number;
				name: string;
			};
			instructorProfile?: {
				id: number;
				activeEmployment?: {
					schoolId: number;
					schoolName: string;
				};
			};
		}

		interface IShortUser {
			id: string;
			name: string;
			surname: string;
		}

		interface IUser extends IShortUser {
			birthday: string;
			createdAt: string;
			isActivated: boolean;
			lastPasswordChange: string;
			role: UserRole;
			email: string;
		}

		interface IAddress {
			street: string;
			buildingNumber: string;
			subBuildingNumber?: number;
			zipCode: string;
			city: string;
			state: string;
		}

		interface ICity {
			id: number;
			name: string;
			state: IState;
		}

		interface IState {
			id: number;
			name: string;
		}

		interface IApplication {
			schoolName: string;
			nip: string;
			ownerName: string;
			ownerSurname: string;
			ownerBirthday: string;
			establishedDate: string;
			street: string;
			buildingNumber: string;
			subBuildingNumber: string;
			zipCode: string;
			city: string;
			state: string;
			nearbyCities: string[];
			email: string;
			phoneNumber: string;
			appliedAt?: string;
			id?: string;
			status?: "pending" | "rejected" | "accepted";
			resolvedAt?: string;
			rejectionReason?: ApplicationRejectionReason;
			rejectionMessage?: string;
		}

		interface IImage {
			id: number;
			url: string;
			uploadDate: string;
		}

		interface IShortSchool {
			id: number;
			name: string;
			description?: string;
			hidden: boolean;
			blocked: boolean;
			coverImage: IImage;
		}

		interface ISchool extends IShortSchool {
			nip: string;
			owner: IShortUser;
			address: IAddress;
			established: string;
			joined: string;
			phoneNumber: string;
			email: string;
			nearbyCities: ICity[];
			courseOffers: CourseCategory[];
			vehicleCount: number;
			instructors: number[];
			oldestVehicleYear?: number;
			coursesCount: number;
			activeCoursesCount: number;
		}

		interface ICityMatching {
			identifier?: number;
			cityName: string;
			state: string;
		}

		type ApplicationRejectionReason =
			| "Unspecified"
			| "InvalidData"
			| "PlatformSaturated"
			| "BadReputation";

		interface ICourseCategory {
			id: number;
			name: string;
			requiredAge?: number;
			specialRequirements: boolean;
		}

		interface ICourseOffer {
			id: number;
			schoolId: number;
			category: ICourseCategory;
			enabled: boolean;
			hoursCount: number;
			price: number;
			pricePerHour: number;
			createdAt: string;
			lastUpdatedAt: string;
			instructors: IShortEmployedInstructor[];
			vehicles: IShortVehicle[];
		}

		interface ISearchCourseOffer {
			id: number;
			school: IShortSchool;
			category: ICourseCategory;
			enabled: boolean;
			hoursCount: number;
			price: number;
		}

		interface IShortInstructorProfile {
			id: number;
			user: IShortUser;
		}

		interface IInstructorProfile extends IShortInstructorProfile {
			employmentHistory: IEmployedInstructor[];
		}

		interface IEmploymentRecord {
			id: number;
			startTime: string;
			endTime?: string;
		}

		interface IShortEmployedInstructor {
			id: number;
			visible: boolean;
			instructor: IShortInstructorProfile;
			schoolId: number;
			assignedCoursesCount: number;
			activeCoursesCount: number;
			maximumConcurrentStudents: number;
			allowedCategories: CourseCategory[];
		}

		interface IEmployedInstructor {
			id: number;
			instructor: IShortInstructorProfile;
			school: IShortSchool;
			detached: boolean;
			employmentRecords: IEmploymentRecord[];
			visible: boolean;
			assignedCourses: IShortCourse[];
			maximumConcurrentStudents: number;
			allowedCategories: CourseCategory[];
		}

		interface IInstructorInvite {
			id: string;
			schoolId: number;
			email: string;
			createdAt: string;
		}

		interface IShortVehicle {
			id: number;
			schoolId: number;
			model: string;
			manufacturingYear: number;
			plate: string;
			lastInspection?: string;
			power?: number;
			displacement?: number;
			transmissionSpeedCount?: number;
			tranmissionType?: TransmissionType;
			allowedIn: CourseCategory[];
			worstPart: IVehiclePartUsage;
		}

		interface IVehiclePartUsage {
			id: number;
			part: {
				id: VehiclePartType;
				lifespanInDays: number;
			};
			lastCheckDate: string;
		}

		interface IVehicleProps {
			model: string;
			manufacturingYear: number;
			plate: string;
			lastInspection?: string;
			power?: number;
			displacement?: number;
			transmissionSpeedCount?: number;
			transmissionType?: TransmissionType;
			mileage?: number;
			mileageUpdateDate?: string;
			note?: string;
		}

		interface IVehicle extends IShortVehicle {
			coverImage: IImage;
			mileage?: number;
			mileageUpdateDate?: string;
			parts: IVehiclePartUsage[];
			note?: string;
		}

		interface IShortCourse {
			id: number;
			category: CourseCategory;
			schoolId: number;
			student: IShortUser;
			instructor: IShortUser;
			instructor: IShortInstructorProfile;
			hoursCount: number;
			pricePerHour: number;
			createdAt: string;
			archived: boolean;
		}

		interface ICourse extends Omit<IShortCourse, "schoolId"> {
			school: IShortSchool;
		}

		interface IShortTransaction {
			id: string;
			state: "Registered" | "Complete" | "Canceled" | "Refund";
			itemCount: number;
			course?: IShortCourse;
			user: IShortUser;
			schoolId: number;
			totalAmount: number;
			registered: string;
			completed?: string;
			lastUpdate: string;
			tPayTransactionId: number;
		}

		interface IShortScheduleSlot {
			id: number;
			instructor: IShortEmployedInstructor;
			startTime: string;
			endTime: string;
		}

		interface IScheduleSlot extends IShortScheduleSlot {
			ride?: IShortRide;
		}

		interface IShortRide {
			id: number;
			status: RideStatus;
			course: IShortCourse;
			startTime?: string;
			endTime?: string;
			hoursCount: number;
		}

		interface IRide extends IShortRide {
			slot?: IShortScheduleSlot;
			vehicle: IShortVehicle;
		}
	}

	namespace UI {
		namespace Navigation {
			interface INavOptionDef {
				icon: JSX.Element;
				name: string;
				link?: string;
				action?: () => void;
			}
		}

		interface IImageData {
			src: string;
			origin: "local" | "remote";
			id: string;
		}

		interface IInteractiveTileBaseDef {
			caption: string;
			helperText?: string;
			icon: JSX.ElementType;
			type: "link" | "action";
		}

		type IInteractiveTileDef<
			T extends "link" | "action" = "link" | "action"
		> =
			| (T extends "link"
					? IInteractiveTileBaseDef & { type: T; link: string }
					: never)
			| (T extends "action"
					? IInteractiveTileBaseDef & { type: T; action: () => void }
					: never);

		interface IVehiclePartDef {
			[key: number]: {
				lastCheckDate: DateTime | null;
				lifespan: number | null;
				icon: string;
				name: string;
			};
		}

		namespace AccountProfile {
			type TAccountPropertyKey = "name" | "surname" | "birthday";

			interface IPropertyEditContext {
				propKey: TAccountPropertyKey;
				label: string;
				type: HTMLInputTypeAttribute;
				value: string;
				minLength?: number;
				maxLength?: number;
			}

			interface IInstructorEmploymentRecord {
				id: number;
				schoolName: string;
				startTime: Date;
				endTime?: Date;
			}
		}
	}

	type AccessLevel = import("../modules/enums").AccessLevel;

	interface IAppContext {
		lightTheme: import("@mui/material").Theme;
		darkTheme: import("@mui/material").Theme;
		activeThemeName: "dark" | "light";
		activeTheme: import("@mui/material").Theme;
		setTheme: (theme: "dark" | "light") => void;
		userDetails: Models.IIdentityUser | null;
		accessLevel: AccessLevel;
		snackBarProps: import("notistack").OptionsObject;
		setModalContent: (content: JSX.Element) => void;
	}

	type TModalClosingListener = (() => boolean) | null;

	interface IModalContext {
		closeModal: () => void;
		setAllowCoverClosing: (state: boolean) => void;
		setOnCoverCloseAttemptListener: (
			listener: TModalClosingListener
		) => void;
		setHostClassName: (className: string | null) => void;
		setRenderHost: (state: boolean) => void;
		hostRef: HTMLElement | null;
	}
}
