import { Typography } from "@mui/material";
import classes from "./NoResultsMessage.module.css";

interface IProps {
	caption: string;
}

export default function NoResultsMessage({ caption }: IProps) {
	return (
		<div className={classes.Container}>
			<img src="/no-results.svg" alt="empty folder" />
			<Typography>{caption}</Typography>
		</div>
	);
}
