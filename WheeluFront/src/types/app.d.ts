export namespace App {

	namespace Models {
		interface IUser {
			userId: string
			name: string
			surname: string
			role: "Student" | "Administrator"
		}

		interface ICity {
			Id: number
			name: string
		}

		interface IApplication {
			schoolName: string
			nip: string
			ownerName: string
			ownerSurname: string
			establishedDate: string
			street: string
			buildingNumber: string
			subBuildingNumber: string
			zipCode: string
			city: string
			nearbyCities: string
			email: string
			phoneNumber: string
			appliedAt?: string
		}
	}

	namespace UI {
		namespace Navigation {
			interface INavOptionDef {
				icon: JSX.Element
				name: string
				link: string
			}
		}
	}

	type AccessLevel = import("../modules/enums").AccessLevel;

	interface IAppContext {
		lightTheme: import("@mui/material").Theme
		darkTheme: import("@mui/material").Theme
		activeTheme: "dark" | "light"
		setTheme: (theme: "dark" | "light")=>void
		userDetails: Models.IUser | null
		accessLevel: AccessLevel
	}
}