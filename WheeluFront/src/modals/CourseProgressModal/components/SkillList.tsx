import { List, ListItem, Typography } from "@mui/material";
import Skill from "./Skill";
import { SkillLevel } from "../../../modules/enums";
import { useEffect } from "react";
import classes from "../CourseProgressModal.module.css";

interface IProps {
	skills: [string, SkillLevel][];
	onChange?: (skillID: string, newLevel: SkillLevel) => void;
	onRendered: () => void;
}

export default function SkillList({ skills, onChange, onRendered }: IProps) {
	useEffect(onRendered, []);

	return (
		<List>
			{skills.map(([ID, level]) => (
				<Skill
					key={ID}
					skillID={ID}
					skillLevel={level}
					onChange={onChange}
				/>
			))}
			{skills.length == 0 && (
				<ListItem className={classes.NoResultsMessage}>
					<Typography variant="caption">
						Brak umiejętności spęłniających kryteria.
					</Typography>
				</ListItem>
			)}
		</List>
	);
}
