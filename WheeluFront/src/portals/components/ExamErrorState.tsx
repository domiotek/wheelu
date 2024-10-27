import { Card, Typography } from "@mui/material";
import { c } from "../../modules/utils";
import commonClasses from "./ExamState.module.css";
import classes from "./ExamKickedState.module.css";
import { useMemo } from "react";

interface IProps {
	errorType: Hubs.ExamHub.RegisterForExamTracking.IResponse["error"];
}

export default function ExamErrorState({ errorType }: IProps) {
	const errorMessage = useMemo(() => {
		switch (errorType) {
			case "AccessDenied":
				return "Nie masz wystarczających uprawnień do tego zasobu.";
			case "InvalidState":
				return "Egzamin już się zakończył, lub jeszcze się nie rozpoczął.";
			case "NoEntity":
				return "Taki egzamin nie istnieje.";
		}
	}, [errorType]);

	return (
		<Card
			className={c([
				commonClasses.StateWrapper,
				classes.KickedStateWrapper,
			])}
		>
			<img src="/logo.png" alt="Logo" />

			<Typography variant="h6">Ten egzamin jest niedostępny</Typography>

			<Typography variant="body2">{errorMessage}</Typography>
		</Card>
	);
}
