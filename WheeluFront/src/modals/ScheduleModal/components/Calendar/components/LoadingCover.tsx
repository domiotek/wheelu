import { LinearProgress } from "@mui/material";
import classes from "./Covers.module.css";

export default function LoadingCover() {
	return (
		<div className={classes.Cover}>
			<LinearProgress className={classes.ProgressBar} />
		</div>
	);
}
