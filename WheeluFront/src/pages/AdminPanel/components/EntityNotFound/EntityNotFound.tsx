import { Button, Card, CardActions, CardContent, CardHeader, CardMedia, Typography } from "@mui/material";
import classes from "./EntityNotFound.module.css";
import { useLocation, useNavigate } from "react-router-dom";

export default function EntityNotFound() {

	const navigate = useNavigate();
	const location = useLocation();

	const goBack = ()=>{
		navigate(location.pathname.split("/").slice(0, -1).join("/"));
	}

	return (
		<div className={classes.Wrapper}>
			<Card className={classes.Card}>
				<CardMedia className={classes.Image} image="/tangled.svg" />
				<CardHeader title="Nic nie odnaleziono"/>
				<CardContent>
					<Typography>
						Twoje zapytanie nie zwróciło żadnych wyników.
					</Typography>
				</CardContent>
				<CardActions sx={{justifyContent: "center"}}>
					<Button onClick={goBack}>Wróć</Button>
				</CardActions>
			</Card>
		</div>
	)
}
