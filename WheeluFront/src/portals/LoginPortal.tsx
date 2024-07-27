import { Button, Card, Checkbox, FormControlLabel, Link, Stack, TextField, Typography } from "@mui/material";
import commonClasses from "./Common.module.css";
import { useNavigate } from "react-router-dom";

export default function LoginPortal() {


	const navigate = useNavigate();


	return (
		<Card sx={{maxWidth: 420, width: "100%",m: 2, p: {xs: 2, sm: 4}}}>
			<Stack alignItems="center" gap="0.5em">
				<img className={commonClasses.Logo} src="/logo.png" alt="Wheelu Logo" />
				<Typography variant="h5">Zaloguj się</Typography>

				<TextField className={commonClasses.Input} variant="filled" label="Email" name="email" type="email" autoComplete="username"/>
				<TextField className={commonClasses.Input} variant="filled" label="Password" name="password" type="password" autoComplete="current-password"/>

				<FormControlLabel 
					sx={{alignSelf: "flex-start", mb: 1}}
					control={<Checkbox />} 
					label="Zapamiętaj mnie" 
					name="persistent" 
				/>

				<Button variant="contained" sx={{mb: 1}}>Zaloguj się</Button>

				<Typography variant="body2">
					Nie masz jeszcze konta? <Link onClick={()=>navigate("/register")}>Zarejestruj się</Link>
				</Typography>
			</Stack>
		</Card>
	)
}
