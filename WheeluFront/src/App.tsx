import { useQuery } from "@tanstack/react-query";
import {
	createContext,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import classes from "./App.module.css";
import {
	CssBaseline,
	Grid,
	ThemeProvider,
	Typography,
	createTheme,
} from "@mui/material";
import { plPL as plPLc } from "@mui/material/locale";
import { plPL as plPLx } from "@mui/x-data-grid/locales/plPL";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import Logo from "./assets/logo.png";
import { API } from "./types/api";
import { callAPI, c, OutsideContextNotifier } from "./modules/utils";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AccessLevel } from "./modules/enums.ts";
import { Bounce, ToastContainer } from "react-toastify";
import ModalContainer from "./components/ModalContainer/ModalContainer.tsx";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";

interface IProps {
	useSplash: boolean;
}

const lightTheme = createTheme(
	{
		palette: {
			primary: { main: "#f67280" },
			secondary: { main: "#5882C0" },
		},
	},
	plPLc,
	plPLx
);

const darkTheme = createTheme(
	{
		palette: {
			mode: "dark",
			primary: { main: "#f67280" },
			secondary: { main: "#3f608e" },
		},
	},
	plPLc,
	plPLx
);

export const AppContext = createContext<App.IAppContext>({
	lightTheme,
	darkTheme,
	activeThemeName: "" as any,
	activeTheme: null as any,
	setTheme: OutsideContextNotifier,
	userDetails: null,
	accessLevel: AccessLevel.Anonymous,
	setModalContent: OutsideContextNotifier,
});

export default function App({ useSplash }: IProps) {
	const [showModal, setShowModal] = useState<boolean>(false);
	const [modalContent, setModalContent] = useState<JSX.Element | null>(null);

	const [splashHidden, setSplashHidden] = useState<boolean>(false);
	const [darkMode, setDarkMode] = useState<boolean>(false);

	const navigate = useNavigate();
	const location = useLocation();

	const { error, data, isFetching } = useQuery<
		API.Auth.Identify.IResponseData,
		API.Auth.Identify.IEndpoint["error"]
	>({
		queryKey: ["User"],
		queryFn: () =>
			callAPI<API.Auth.Identify.IEndpoint>(
				"GET",
				"/api/v1/auth/identify"
			),
		retry: false,
		staleTime: 60000,
	});

	const accessLevel = useMemo(() => {
		switch (data?.role) {
			case "Administrator":
				return AccessLevel.Administrator;
			case "SchoolManager":
				return AccessLevel.SchoolOwner;
			case "Student":
				return AccessLevel.Student;
			case "Instructor":
				return AccessLevel.Instructor;
			default:
				return AccessLevel.Anonymous;
		}
	}, [data]);

	const modalContentSetter = useCallback((content: JSX.Element) => {
		setModalContent(content);
		setShowModal(true);
	}, []);

	useEffect(() => {
		if (!isFetching) {
			const currentURL = location.pathname;
			const anonymousRoutes = [
				"/",
				"/apply",
				"/logout",
				"/join",
				"/reset-password",
			];
			const unauthenticatedRoutes = [
				"/login",
				"/register",
				"/resend-activation-link",
				"/activate-account",
				"/create-instructor",
			];
			const isAuthenticated = error == null;

			if (
				!isAuthenticated &&
				error.code == "Unauthorized" &&
				!unauthenticatedRoutes.includes(currentURL) &&
				!anonymousRoutes.includes(currentURL)
			) {
				navigate("/login");
				return;
			} else if (
				isAuthenticated &&
				unauthenticatedRoutes.includes(currentURL)
			) {
				navigate("/home");
				return;
			}

			if (
				error == null ||
				unauthenticatedRoutes.includes(currentURL) ||
				anonymousRoutes.includes(currentURL)
			)
				setTimeout(() => setSplashHidden(true), 400);
		}
	}, [data, error, location]);

	return (
		<AppContext.Provider
			value={{
				lightTheme,
				darkTheme,
				activeThemeName: darkMode ? "dark" : "light",
				activeTheme: darkMode ? darkTheme : lightTheme,
				setTheme: (theme) => setDarkMode(theme == "dark"),
				userDetails: data ?? null,
				accessLevel,
				setModalContent: modalContentSetter,
			}}
		>
			<LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale="pl">
				<ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
					<CssBaseline>
						<Outlet />

						<Grid
							container
							className={c([
								classes.SplashScreen,
								[classes.AlwaysHidden, !useSplash],
								[classes.Intermediate, data != undefined],
								[classes.Hide, splashHidden],
							])}
							sx={{
								background: (darkMode ? darkTheme : lightTheme)
									.palette.background.default,
							}}
						>
							<img
								className={classes.SplashScreenLogo}
								src={Logo}
								alt="App logo"
							/>
							{error && error.code != "Unauthorized" ? (
								<>
									<Typography variant="h6">
										Coś poszło nie tak
									</Typography>
									<Typography variant="body2">
										Spróbuj przeładować aplikację
									</Typography>
								</>
							) : (
								<Typography variant="h6">
									Jeszcze chwila...
								</Typography>
							)}
						</Grid>
						<ModalContainer
							show={showModal}
							onClose={() => {
								setShowModal(false);
								setModalContent(null);
							}}
						>
							{modalContent}
						</ModalContainer>

						<ToastContainer
							position="bottom-right"
							autoClose={5000}
							closeOnClick
							pauseOnFocusLoss
							draggable
							pauseOnHover
							theme={darkMode ? "dark" : "light"}
							transition={Bounce}
							stacked
						/>
					</CssBaseline>
				</ThemeProvider>
			</LocalizationProvider>
			<ReactQueryDevtools initialIsOpen={false} />
		</AppContext.Provider>
	);
}
