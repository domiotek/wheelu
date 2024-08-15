import { CircularProgress } from "@mui/material";

import classes from "./LoadingScreen.module.css";

export default function LoadingScreen() {
	return (
		<div className={classes.Wrapper}>
			<CircularProgress size={80} />
		</div>
	)
}
