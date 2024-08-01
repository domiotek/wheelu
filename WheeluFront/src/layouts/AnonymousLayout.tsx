import { Person } from "@mui/icons-material";
import { AppBar, Button, Stack, Typography } from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";

import classes from "./AnonymousLayout.module.css";
import { useContext } from "react";
import { AppContext } from "../App";

export default function AnonymousLayout() {

	const navigate = useNavigate();

	const {userDetails} = useContext(AppContext);

	return (
		<>
			<AppBar className={classes.Header} elevation={0} sx={{background: theme=>theme.palette.background.default }}>
				<img src="/logo.png" alt="Wheelu logo"/>

				<Button startIcon={<Person />} variant="outlined" color="secondary" onClick={()=>navigate("/login")}>
					{userDetails?`Cześć ${userDetails.name}`:"Zaloguj się"}
				</Button>
			</AppBar>
			
			<Outlet />

			<Stack sx={{background: theme=>theme.palette.grey[800], color: theme=>theme.palette.getContrastText(theme.palette.grey[800])}}>
					<Stack className={classes.FooterItemWrapper}>
						<img src="/logo.png" alt="Wheelu logo"/>
						<Stack className={classes.FooterItem}>
							<Typography variant="subtitle1">Wheelu</Typography>
							<Typography variant="body2">Platforma do nauki jazdy</Typography>
						</Stack>
						
						<Stack className={classes.FooterItem}>
							<Typography variant="body1">Kontakt</Typography>
							<Typography variant="body2">wheelu@omiotech.pl</Typography>
						</Stack>
						<Stack className={classes.FooterItem}>
							<Typography variant="body1">Jesteś właścicielem szkoły jazdy?</Typography>
							<Typography variant="body2">Sprawdź jak dołączyć</Typography>
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
