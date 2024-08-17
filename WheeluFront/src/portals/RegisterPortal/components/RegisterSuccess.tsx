import { Card, Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink} from "react-router-dom";

import classes from "../RegisterPortal.module.css"
import commonClasses from "../../Common.module.css"

export default function RegisterSuccess() {

	return (
		<Card className={classes.RegisterPanel} sx={{m: 2, p: {xs: 2, sm: 4}}}>
			<Stack alignItems="center" gap="0.5em">
				<img className={commonClasses.Logo} src="/logo.png" alt="Wheelu Logo" />
				<Typography variant="h5">To prawie wszystko!</Typography>

				<Typography className={classes.SuccessMessageText}>
					Kolejne kroki znajdziesz w wiadomości, którą wysłaliśmy właśnie na Twój adres email.
				</Typography>

				<Typography variant="body2">
					W skrzynce pusto? <Link component={<RouterLink to={"/resend-activation-link"}/> as any}>Wyślij jeszcze raz</Link>
				</Typography>
			</Stack>
		</Card>
	)
}
