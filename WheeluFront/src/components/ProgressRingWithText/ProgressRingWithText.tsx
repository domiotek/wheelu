import { CircularProgress, Typography } from "@mui/material";
import classes from "./ProgressRingWithText.module.css";
import { c } from "../../modules/utils";

interface IProps {
	className?: string;
	value: number;
	caption: string;
	color?: "primary" | "secondary" | "error" | "info" | "success" | "warning";
}

export default function ProgressRingWithText({
	className,
	value,
	caption,
	color,
}: IProps) {
	return (
		<div
			className={c([
				classes.Wrapper,
				[className!, className != undefined],
			])}
		>
			<CircularProgress
				variant="determinate"
				value={value}
				color={color}
			/>
			<Typography component="p" variant="body2">
				{caption}
			</Typography>
		</div>
	);
}
