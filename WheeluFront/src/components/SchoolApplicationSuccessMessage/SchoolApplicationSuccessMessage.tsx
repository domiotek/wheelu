import { Button, Card, CardActions, CardContent, CardMedia, Typography } from "@mui/material";

import classes from "./SchoolApplicationSuccessMessage.module.css";
import { useNavigate } from "react-router-dom";

export default function SchoolApplicationSuccessMessage() {

	const navigate = useNavigate();

	return (
		<div className={classes.Wrapper}>
			<Card className={classes.MessageContainer}>
				<CardMedia
					className={classes.Image}
					image="/mail-sent.svg"
					title="Email sent"
				/>

				<CardContent>
					<Typography variant="h4" gutterBottom>Udało się!</Typography>
					<Typography variant="body2" gutterBottom color="text.secondary">
						Właśnie wysłaliśmy do Ciebie potwierdzenie przyjęcia zgłoszenia.
					</Typography>

					<Typography variant="caption">
						Sprawdź swoją skrzynkę pocztową.
					</Typography>
				</CardContent>
				<CardActions className={classes.ActionsWrapper}>
					<Button variant="contained" onClick={()=>navigate("/")}>Powrót</Button>
				</CardActions>
			</Card>
		</div>
	)
}
