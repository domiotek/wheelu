import {
	Avatar,
	ListItem,
	ListItemAvatar,
	ListItemText,
	Paper,
} from "@mui/material";
import {
	initialsAvatarProps,
	renderCategoryChips,
} from "../../modules/features";
import { formatPolishWordSuffix } from "../../modules/utils";
import InlineDot from "../InlineDot/InlineDot";
import classes from "./InstructorPanel.module.css";
import { ReactNode } from "react";

interface IProps {
	instructor: App.Models.IEmployedInstructor;
	action?: ReactNode;
}

export default function InstructorPanel({ instructor, action }: IProps) {
	const activeCoursesCount = instructor.assignedCourses.filter(
		(c) => !c.archived
	).length;

	return (
		<Paper
			key={instructor.id}
			className={classes.InstructorPanel}
			component={ListItem}
		>
			<div className={classes.Content}>
				<ListItemAvatar>
					<Avatar
						{...initialsAvatarProps(
							`${instructor.instructor.user.name} ${instructor.instructor.user.surname}`
						)}
					/>
				</ListItemAvatar>
				<ListItemText
					className={classes.Text}
					primary={
						<>
							{instructor.instructor.user.name}{" "}
							{instructor.instructor.user.surname}
							<br />
							{renderCategoryChips(instructor.allowedCategories)}
						</>
					}
					secondary={
						<>
							{instructor.assignedCourses.length} kursów (
							{activeCoursesCount} aktywn
							{formatPolishWordSuffix(activeCoursesCount, [
								"y",
								"e",
								"ych",
							])}
							)
							<InlineDot color="secondary" />
							{instructor.instructor.grade.toFixed(1)}
						</>
					}
				/>
			</div>
			{action}
		</Paper>
	);
}
