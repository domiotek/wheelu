import { Person } from "@mui/icons-material";
import { Button, Link, Stack, Theme, Typography } from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";

import classes from "./AnonymousLayout.module.css";
import { Suspense, useContext } from "react";
import { AppContext } from "../App";
import LoadingScreen from "../components/LoadingScreen/LoadingScreen";
import ElevatedHeader from "../components/ElevatedHeader/ElevatedHeader";
import { useTheme } from "@emotion/react";

export default function AnonymousLayout() {

	const navigate = useNavigate();

	const {userDetails} = useContext(AppContext);

	const theme = useTheme() as Theme;

	return (
		<>
			<ElevatedHeader className={classes.Header} sx={{background: theme.palette.background.default }}>
				<img src="/logo.png" alt="Wheelu logo"/>

				<Button startIcon={<Person />} variant="outlined" color="secondary" onClick={()=>navigate("/login")}>
					{userDetails?`Cześć ${userDetails.name}`:"Zaloguj się"}
				</Button>
			</ElevatedHeader>
			
			<Suspense fallback={<LoadingScreen />}>
				<Outlet />
			</Suspense>

			<Stack sx={{background: theme=>theme.palette.grey[800], color: theme=>theme.palette.getContrastText(theme.palette.grey[800])}}>
					<Stack className={classes.FooterItemWrapper}>
						<img src="/logo.png" alt="Wheelu logo"/>
						<Stack className={classes.FooterItem}>
							<Typography variant="subtitle1">Wheelu</Typography>
							<Typography variant="body2">Platforma do nauki jazdy</Typography>
						</Stack>
						
						<Stack className={classes.FooterItem}>
							<Typography variant="body1">Kontakt</Typography>
							<Typography variant="body2">
								<Link href="mailto:wheelu@omiotech.pl">wheelu@omiotech.pl</Link>
							</Typography>
						</Stack>
						<Stack className={classes.FooterItem}>
							<Typography variant="body1">Jesteś właścicielem szkoły jazdy?</Typography>
							<Typography variant="body2">
								<Link onClick={()=>navigate("/apply")}>Sprawdź jak dołączyć</Link>
							</Typography>
						</Stack>
						<Stack className={classes.FooterItem}>
							<Typography variant="body1">Użyte zasoby</Typography>
							<Typography variant="body2">Zobacz pęłną listę</Typography>
						</Stack>
					</Stack>
					<Typography className={classes.CopyrightDisclaimer} variant="caption">&copy;2024 Wszystkie prawa zastrzeżone</Typography>
				</Stack>
		</>
	)
}
