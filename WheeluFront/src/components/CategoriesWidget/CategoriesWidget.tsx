import { Chip } from "@mui/material";
import classes from "./CategoriesWidget.module.css";
import { c } from "../../modules/utils";
import { CourseCategoriesMapping } from "../../modules/constants";
import { CourseCategory } from "../../modules/enums";

interface IProps {
	className?: string;
	enabledList?: Set<CourseCategory>;
}

export default function CategoriesWidget({ className, enabledList }: IProps) {
	return (
		<div
			className={c([
				classes.Wrapper,
				[className!, className != undefined],
			])}
		>
			{CourseCategoriesMapping.map((category) => (
				<Chip
					key={category.id}
					label={category.name}
					variant={
						enabledList?.has(category.id) ? "filled" : "outlined"
					}
					color="secondary"
				/>
			))}
		</div>
	);
}
