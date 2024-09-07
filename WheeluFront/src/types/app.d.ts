import AdminPanel from "../pages/AdminPanel/AdminPanel";

export namespace App {
	namespace Models {
		type UserRole = "Student" | "Administrator" | "SchoolManager";

		interface IIdentityUser {
			userId: string;
			name: string;
			surname: string;
			role: UserRole;
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

		interface ISchool {
			id: number;
			name: string;
			description?: string;
			nip: string;
			hidden: boolean;
			blocked: boolean;
			owner: IShortUser;
			address: IAddress;
			established: string;
			joined: string;
			phoneNumber: string;
			coverImage: IImage;
			nearbyCities: ICity[];
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
	}

	namespace UI {
		namespace Navigation {
			interface INavOptionDef {
				icon: JSX.Element;
				name: string;
				link: string;
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
	}

	type AccessLevel = import("../modules/enums").AccessLevel;

	interface IAppContext {
		lightTheme: import("@mui/material").Theme;
		darkTheme: import("@mui/material").Theme;
		activeTheme: "dark" | "light";
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
	}
}
