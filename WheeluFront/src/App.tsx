import { useQuery } from '@tanstack/react-query'
import { createContext, useEffect, useState } from 'react';
import classes from "./App.module.css";
import { CssBaseline, Grid, ThemeProvider, Typography, createTheme } from '@mui/material';

import Logo from "./assets/logo.png";
import { API } from './types/api';
import { callAPI, resolveClasses as c, OutsideContextNotifier} from './modules/utils';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { App as AppNm } from './types/app';


interface IProps {
	useSplash: boolean
}

const lightTheme = createTheme({palette: {primary: {main: "#f67280"}, secondary: {main: "#5882C0"}}});

const darkTheme = createTheme({
	palette: {
	  mode: 'dark',
	  primary: {main: "#f67280"},
	  secondary: {main: "#3f608e"}
	}
});


export const AppContext = createContext<AppNm.IAppContext>({lightTheme, darkTheme, activeTheme: "" as any, setTheme: OutsideContextNotifier});

export default function App({useSplash}: IProps) {
	const {error, data, isFetching} = useQuery<API.UserData.IResponseData, API.UserData.IEndpoint["error"]>({
        queryKey: ["UserData"],
        queryFn: ()=>callAPI<API.UserData.IEndpoint>("GET","/api/v1/auth/identify"),
        retry: false,
		staleTime: 60000
    });

	const [splashHidden, setSplashHidden] = useState<boolean>(false);
	const [darkMode, setDarkMode] = useState<boolean>(false);

	const navigate = useNavigate();
	const location = useLocation();

	useEffect(()=>{
		if(!isFetching) {
			const currentURL = location.pathname;
			const anonymousRoutes = ["/start"];
			const unauthenticatedRoutes = ["/login", "/register"];
			const isAuthenticated = error==null;


			if(!isAuthenticated&&!unauthenticatedRoutes.includes(currentURL)&&!anonymousRoutes.includes(currentURL)) {
				navigate("/login");
				return;
			}else if(isAuthenticated&&unauthenticatedRoutes.includes(currentURL)) {
				navigate("/");
				return;
			}

			setTimeout(()=>setSplashHidden(true), 400);
		}

	},[data, error]);

	return (
		<AppContext.Provider value={{lightTheme, darkTheme, activeTheme: darkMode?"dark":"light", setTheme: (theme)=>setDarkMode(theme=="dark")}}>
				<ThemeProvider theme={darkMode?darkTheme:lightTheme}>
					<CssBaseline>
						<Outlet />

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
								error?
									<>
										<Typography variant='h6'>
											Something went wrong
										</Typography>
										<Typography variant="body2">
											Try reloading the application.
										</Typography>
									</>
								:
								<Typography variant='h6'>
									Hang on a second...
								</Typography>
							}
						</Grid>
					</CssBaseline>
				</ThemeProvider>
		</AppContext.Provider>
	)
}
