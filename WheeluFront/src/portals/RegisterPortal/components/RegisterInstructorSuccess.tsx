import { Button, Card, Stack, Typography } from "@mui/material";

import classes from "../RegisterPortal.module.css";
import commonClasses from "../../Common.module.css";
import { useNavigate } from "react-router-dom";

export default function RegisterInstructorSuccess() {
	const navigate = useNavigate();

	return (
		<Card
			className={classes.RegisterPanel}
			sx={{ m: 2, p: { xs: 2, sm: 4 } }}
		>
			<Stack alignItems="center" gap="0.5em">
				<img
					className={commonClasses.Logo}
					src="/logo.png"
					alt="Wheelu Logo"
				/>
				<Typography variant="h5">To wszystko!</Typography>

				<Typography className={classes.SuccessMessageText}>
					Twoje konto zostało utworzone i połączone ze szkołą, która
					Cię zaprosiła. Teraz pozostało tylko sie już zalogować.
				</Typography>

				<Button variant="contained" onClick={() => navigate("/login")}>
					Zaloguj się
				</Button>
			</Stack>
		</Card>
	);
}
