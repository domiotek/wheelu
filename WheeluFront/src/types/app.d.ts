export namespace App {

	namespace Models {
		interface IUser {
			userId: string
			name: string
			surname: string
			role: string
		}
	}
	


	interface IAppContext {
		lightTheme: import("@mui/material").Theme
		darkTheme: import("@mui/material").Theme
		activeTheme: "dark" | "light"
		setTheme: (theme: "dark" | "light")=>void
		userDetails: Models.IUser | null
	}
}