import { Card, Typography } from "@mui/material";
import { c } from "../../modules/utils";
import commonClasses from "./ExamState.module.css";
import classes from "./ExamPendingState.module.css";

export default function ExamPendingState() {
	return (
		<Card
			className={c([
				commonClasses.StateWrapper,
				classes.PendingStateWrapper,
			])}
		>
			<img src="/logo.png" alt="Logo" />

			<Typography variant="overline">
				Inicjalizowanie sesji egzaminu...
			</Typography>
		</Card>
	);
}
