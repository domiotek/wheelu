import { Typography } from "@mui/material";
import classes from "./MessagePanel.module.css";
import { c } from "../../modules/utils";

interface IProps {
	caption: string;
	image: string;
	alt?: string;
	className?: string;
}

export default function MessagePanel({
	caption,
	image,
	alt,
	className,
}: IProps) {
	return (
		<div
			className={c([
				[className!, className != undefined],
				classes.Container,
			])}
		>
			<img src={image} alt={alt} />
			<Typography>{caption}</Typography>
		</div>
	);
}
