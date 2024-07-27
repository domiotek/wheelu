import { Button, TextField, Typography, Link, Card, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

import commonClasses from "./Common.module.css";
import classes from "./RegisterPortal.module.css";


export default function RegisterPortal() {

	const navigate = useNavigate();

	return (
		<Card className={classes.RegisterPanel} sx={{m: 2, p: {xs: 2, sm: 4}}}>
			<Stack alignItems="center" gap="0.5em">
				<img className={commonClasses.Logo} src="/logo.png" alt="Wheelu Logo" />
				<Typography variant="h5">Zarejestruj się</Typography>
				
				<Stack className={commonClasses.InputContainer}>
					<Stack className={commonClasses.InputGroup}>
						<TextField className={commonClasses.Input} error variant="filled" label="Email" name="email" type="email" autoComplete="username"/>
						<TextField className={commonClasses.Input} variant="filled" label="Imię" name="name" type="text" autoComplete="given-name"/>
						<TextField className={commonClasses.Input} variant="filled" label="Nazwisko" name="surname" type="text" autoComplete="family-name"/>
						<TextField className={commonClasses.Input} variant="filled" InputLabelProps={{shrink: true}} label="Data urodzenia" name="birthday" type="date" autoComplete="birthday"/>
					</Stack>
					
					<Stack className={commonClasses.InputGroup}>
						<TextField className={commonClasses.Input} variant="filled" label="Password" name="password" type="password" autoComplete="new-password"/>
						<TextField className={commonClasses.Input} variant="filled" label="Confirm Password" name="cpassword" type="password" autoComplete="new-password"/>
					</Stack>
				</Stack>
			
				<Button variant="contained" sx={{mb: 1}}>Zarejestruj się</Button>

				<Typography variant="body2">
					Masz już konto? <Link onClick={()=>navigate("/login")}>Przejdź do logowania</Link>
				</Typography>
			</Stack>
		</Card>
	)
}
