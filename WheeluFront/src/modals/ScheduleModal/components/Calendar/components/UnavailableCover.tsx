import { Button, Card, CardContent, Typography } from "@mui/material";
import classes from "./Covers.module.css";
import { c } from "../../../../../modules/utils";
import { useContext } from "react";
import { ModalContext } from "../../../../../components/ModalContainer/ModalContainer";

export default function UnavailableCover() {
	const { closeModal } = useContext(ModalContext);

	return (
		<div className={c([classes.Cover, classes.UnavailableCover])}>
			<Card>
				<CardContent className={classes.UnavailableMessage}>
					<Typography variant="h6">Widok niedostępny</Typography>
					<Typography>
						Wygląda na to, że nie jesteś aktualnie zatrudniony/-a
					</Typography>

					<Button variant="contained" onClick={closeModal}>
						Zamknij
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
