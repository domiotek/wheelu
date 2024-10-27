import { Card, Typography } from "@mui/material";
import { c } from "../../modules/utils";
import commonClasses from "./ExamState.module.css";
import classes from "./ExamKickedState.module.css";

export default function ExamKickedState() {
	return (
		<Card
			className={c([
				commonClasses.StateWrapper,
				classes.KickedStateWrapper,
			])}
		>
			<img src="/logo.png" alt="Logo" />

			<Typography variant="h6">Sesja przerwana</Typography>

			<Typography variant="body2">
				Została utworzona inna sesja egzaminacyjna.
				<br />
				<b>Bez obaw, wszystkie Twoje zmiany zostały zapisane.</b>
				<br />
				<Typography variant="overline">Co się stało?</Typography>
				<br />
				Częstą przyczyną jest próba otwarcia tej strony w dodatkowej
				karcie.
			</Typography>
		</Card>
	);
}
