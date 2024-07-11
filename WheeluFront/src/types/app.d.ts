export namespace App {
	interface IAppContext {
		lightTheme: import("@mui/material").Theme
		darkTheme: import("@mui/material").Theme
		activeTheme: "dark" | "light"
		setTheme: (theme: "dark" | "light")=>void
	}
}