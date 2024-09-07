import { useQuery } from '@tanstack/react-query'
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import classes from "./App.module.css";
import { CssBaseline, Grid, ThemeProvider, Typography, createTheme } from '@mui/material';
import { plPL as plPLc} from '@mui/material/locale';
import { plPL as plPLx } from "@mui/x-data-grid/locales/plPL";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import Logo from "./assets/logo.png";
import { API } from './types/api';
import { callAPI, c, OutsideContextNotifier} from './modules/utils';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { App as AppNm } from "./types/app";
import { AccessLevel } from './modules/enums.ts';
import { OptionsObject, SnackbarProvider } from 'notistack';
import ModalContainer from './components/ModalContainer/ModalContainer.tsx';


interface IProps {
	useSplash: boolean
}

const lightTheme = createTheme({
	palette: {
		primary: {main: "#f67280"}, 
		secondary: {main: "#5882C0"}
	}
}, plPLc, plPLx);

const darkTheme = createTheme({
	palette: {
	  mode: 'dark',
	  primary: {main: "#f67280"},
	  secondary: {main: "#3f608e"}
	}
}, plPLc, plPLx);


const commonSnackBarProps: OptionsObject = {
	anchorOrigin: {horizontal: "right", vertical: "bottom"},
	preventDuplicate: true
}

export const AppContext = createContext<AppNm.IAppContext>(
	{
		lightTheme, 
		darkTheme, 
		activeTheme: "" as any, 
		setTheme: OutsideContextNotifier,
		userDetails: null,
		accessLevel: AccessLevel.Anonymous,
		snackBarProps: commonSnackBarProps,
		setModalContent: OutsideContextNotifier
	}
);

export default function App({useSplash}: IProps) {
	const [showModal, setShowModal] = useState<boolean>(false);
    const [modalContent, setModalContent] = useState<JSX.Element | null>(null);

	const [splashHidden, setSplashHidden] = useState<boolean>(false);
	const [darkMode, setDarkMode] = useState<boolean>(false);

	const navigate = useNavigate();
	const location = useLocation();


	const {error, data, isFetching} = useQuery<API.Auth.Identify.IResponseData, API.Auth.Identify.IEndpoint["error"]>({
        queryKey: ["User"],
        queryFn: ()=>callAPI<API.Auth.Identify.IEndpoint>("GET","/api/v1/auth/identify"),
        retry: false,
		staleTime: 60000
    });


	const accessLevel = useMemo(()=>{
		switch(data?.role) {
			case "Administrator": return AccessLevel.Administrator;
			case "Student": return AccessLevel.Student;
			default: return AccessLevel.Anonymous;
		}
	},[data]);

	const modalContentSetter = useCallback((content: JSX.Element)=>{
        setModalContent(content);
        setShowModal(true);
    }, []);


	useEffect(()=>{
		if(!isFetching) {
			const currentURL = location.pathname;
			const anonymousRoutes = ["/", "/register-school", "/logout"];
			const unauthenticatedRoutes = ["/login", "/register", "/resend-activation-link", "/activate-account", "/reset-password"];
			const isAuthenticated = error==null;


			if(!isAuthenticated&&!unauthenticatedRoutes.includes(currentURL)&&!anonymousRoutes.includes(currentURL)) {
				navigate("/login");
				return;
			}else if(isAuthenticated&&unauthenticatedRoutes.includes(currentURL)) {
				navigate("/home");
				return;
			}

			setTimeout(()=>setSplashHidden(true), 400);
		}

	},[data, error, location]);

	return (
		<AppContext.Provider value={{
				lightTheme, 
				darkTheme, 
				activeTheme: darkMode?"dark":"light", 
				setTheme: (theme)=>setDarkMode(theme=="dark"),
				userDetails: data ?? null,
				accessLevel,
				snackBarProps: commonSnackBarProps,
				setModalContent: modalContentSetter
			}}
		>
			<ThemeProvider theme={darkMode?darkTheme:lightTheme}>
				<CssBaseline>
					<SnackbarProvider>
						<Outlet />
					</SnackbarProvider>

					<Grid container className={c(
						[
							classes.SplashScreen, 
							[classes.AlwaysHidden, !useSplash],
							[classes.Intermediate, data!=undefined],
							[classes.Hide, splashHidden]
						]
					)} sx={{background: (darkMode?darkTheme:lightTheme).palette.background.default}}>

						<img className={classes.SplashScreenLogo} src={Logo} alt="App logo"/>
						{
							error&&error.code!="Unauthorized"?
								<>
									<Typography variant='h6'>
										Coś poszło nie tak
									</Typography>
									<Typography variant="body2">
										Spróbuj przeładować aplikację
									</Typography>
								</>
							:
							<Typography variant='h6'>
								Jeszcze chwila...
							</Typography>
						}
					</Grid>
					<ModalContainer show={showModal} onClose={()=>{setShowModal(false); setModalContent(null)}}>{modalContent}</ModalContainer>
				</CssBaseline>
			</ThemeProvider>
			<ReactQueryDevtools initialIsOpen={false} />
		</AppContext.Provider>
	)
}
