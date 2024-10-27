import { Email } from "@mui/icons-material";
import {
	CourseCategory,
	ExamState,
	requestorType,
	RequestStatus,
	RideStatus,
	SkillLevel,
	TransmissionType,
	VehiclePartType,
} from "../modules/enums";
import AdminPanel from "../pages/AdminPanel/AdminPanel";
import { DateTime } from "luxon";
import { HTMLInputTypeAttribute, MutableRefObject, ReactNode } from "react";
import { AlertColor } from "@mui/material";
declare global {
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
				instructors: ILimitedEmployedInstructor[];
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
				instructor: IShortInstructorProfile;
				schoolId: number;
			}

			interface ILimitedEmployedInstructor
				extends IShortEmployedInstructor {
				visible: boolean;
				assignedCoursesCount: number;
				activeCoursesCount: number;
				maximumConcurrentStudents: number;
				allowedCategories: CourseCategory[];
			}

			interface IEmployedInstructor
				extends Omit<
					ILimitedEmployedInstructor,
					"schoolId" | "assignedCoursesCount" | "activeCoursesCount"
				> {
				school: IShortSchool;
				detached: boolean;
				employmentRecords: IEmploymentRecord[];
				assignedCourses: ILimitedCourse[];
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

			namespace CourseProgress {
				type GeneralSkillTypes =
					| "preparingVehicle"
					| "clutchAndShifting"
					| "componentKnowledge"
					| "lightsHandling"
					| "harshConditionsDriving";
				interface IGeneralSkills {
					[skillName: GeneralSkillTypes]: SkillLevel;
				}

				type GeneralDrivingSkillTypes =
					| "rounaboutCrossing"
					| "laneChanging"
					| "classicIntersection"
					| "givingWayPedestrians"
					| "givingWayVehicles"
					| "bicycleOvertaking"
					| "vehicleOvertaking"
					| "dynamicDriving"
					| "speedAdjusting";

				interface IGeneralDrivingSkills {
					[skillName: GeneralDrivingSkillTypes]: SkillLevel;
				}

				type HighwayDrivingSkillTypes =
					| "overtaking"
					| "laneChanging"
					| "speedAdjusting";

				interface IHighwayDrivingSkills {
					[skillName: HighwayDrivingSkillTypes]: SkillLevel;
				}

				type ManeuverSkillTypes =
					| "perpendicularParking"
					| "parallelParking"
					| "diagonalParking"
					| "startingUpTheHill"
					| "stoppingAtDestination"
					| "turningAroundOnIntersection"
					| "turningAroundUsingInfrastructure";

				interface IManeuverSkills {
					[skillName: ManeuverSkillTypes]: SkillLevel;
				}
			}

			interface ICourseProgress
				extends Record<string, Record<SkillLevel>> {
				generalSkills: CourseProgress.IGeneralSkills;
				developedAreaSkills: CourseProgress.IGeneralDrivingSkills;
				undevelopedAreaSkills: CourseProgress.IGeneralDrivingSkills;
				highwaySkills: CourseProgress.IHighwayDrivingSkills;
				maneuverSkills: CourseProgress.IManeuverSkills;
			}

			interface IShortCourse {
				id: number;
				category: CourseCategory;
				schoolId: number;
				student: IShortUser;
				instructor: IShortUser;
			}

			interface ILimitedCourse {
				id: number;
				category: CourseCategory;
				schoolId: number;
				student: IShortUser;
				instructor: IShortUser;
				hoursCount: number;
				pricePerHour: number;
				createdAt: string;
				archived: boolean;
			}

			interface ICourse extends Omit<ILimitedCourse, "schoolId"> {
				instructorId: number;
				schoolInstructorId: number;
				school: IShortSchool;
				usedHours: number;
				nextRide?: IShortRide;
				ongoingRide?: IShortRide;
				nextExam?: IShortExam;
				courseProgress: ICourseProgress;
				passedInternalExam: boolean;
			}

			type TransactionState =
				| "Registered"
				| "Complete"
				| "Canceled"
				| "Refund";

			interface IShortTransaction {
				id: string;
				state: TransactionState;
				itemCount: number;
				course?: ILimitedCourse;
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
				instructor: ILimitedEmployedInstructor;
				startTime: string;
				endTime: string;
			}

			interface IScheduleSlot extends IShortScheduleSlot {
				ride?: IShortRide;
			}

			interface IShortRide {
				id: number;
				status: RideStatus;
				slot?: IShortScheduleSlot;
				course: IShortCourse;
				startTime: string;
				endTime: string;
				hoursCount: number;
				examId: number;
			}

			interface IRide extends Omit<IShortRide, "examId"> {
				vehicle: IShortVehicle;
				exam?: IShortExam;
			}

			interface IShortExam {
				id: number;
				courseId: number;
				rideId: number;
				date: string;
				state: ExamState;
				passedItems: number;
				totalItems: number;
			}

			interface IExam {
				id: number;
				course: IShortCourse;
				ride: IShortRide;
				state: ExamState;
				result: Models.ExamResult.IResult;
			}

			interface IHourPackage {
				id: number;
				course: IShortCourse;
				transactionID?: string;
				status?: TransactionState;
				totalPaymentAmount: number;
				hoursCount: number;
				created: string;
			}

			interface IInstructorChangeRequest {
				id: number;
				status: RequestStatus;
				requestor: IShortUser;
				requestorType: requestorType;
				course: IShortCourse;
				requestedInstructor?: IShortEmployedInstructor;
				note: string;
				requestedAt: string;
				lastStatusChange: string;
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
						? IInteractiveTileBaseDef & {
								type: T;
								action: () => void;
						  }
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

			namespace CoursePage {
				interface IAlertDef {
					title: string;
					content: string;
					action?: ReactNode;
					variant: AlertColor;
				}
			}

			namespace PurchaseFlow {
				interface IStepDef {
					name: string;
					view: JSX.Element;
				}

				interface ICartItemDef {
					name: string;
					helper: ReactNode;
					count: number;
					pricePerItem: number;
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
			setModalContent: (content: JSX.Element) => void;
		}

		type TModalClosingListener = (() => boolean) | null;

		interface IInternalModal {
			shown: MutableRefObject<boolean>;
			closeMe: () => void;
		}

		interface IModalContext {
			__root: boolean;
			__registerChildModal: (internalModalInfo: IInternalModal) => void;
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
}
