import { Chip } from "@mui/material";
import classes from "./CategoriesWidget.module.css";
import { c } from "../../modules/utils";

interface IProps {
	className?: string;
}

export default function CategoriesWidget({ className }: IProps) {
	return (
		<div
			className={c([
				classes.Wrapper,
				[className!, className != undefined],
			])}
		>
			<Chip label="AM" variant="outlined" color="secondary" />
			<Chip label="A" variant="outlined" color="secondary" />
			<Chip label="B" variant="outlined" color="secondary" />
			<Chip label="C" variant="outlined" color="secondary" />
			<Chip label="D" variant="outlined" color="secondary" />
			<Chip label="T" variant="outlined" color="secondary" />
			<Chip label="A1" variant="filled" color="secondary" />
			<Chip label="A2" variant="outlined" color="secondary" />
			<Chip label="B1" variant="outlined" color="secondary" />
			<Chip label="C1" variant="outlined" color="secondary" />
			<Chip label="D1" variant="outlined" color="secondary" />
		</div>
	);
}
