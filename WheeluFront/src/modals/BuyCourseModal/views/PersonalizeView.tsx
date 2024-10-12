import {
	Avatar,
	Button,
	Divider,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	Stack,
	Typography,
} from "@mui/material";
import MessagePanel from "../../../components/MessagePanel/MessagePanel";
import { Fragment } from "react/jsx-runtime";
import { initialsAvatarProps } from "../../../modules/features";
import InlineDot from "../../../components/InlineDot/InlineDot";
import { App } from "../../../types/app";
import commonClasses from "../BuyCourseModal.module.css";
import { formatPolishWordSuffix } from "../../../modules/utils";

interface IProps {
	course: App.Models.ICourseOffer;
	selectedInstructorId: number | null;
	updateSelectedInstructorId: (id: number) => void;
}

export default function PersonalizeView({
	course,
	selectedInstructorId,
	updateSelectedInstructorId,
}: IProps) {
	return (
		<section>
			<Typography variant="h6">Instruktorzy</Typography>
			<Divider />

			{course.instructors.length > 0 ? (
				<List>
					{course.instructors.map((instructor) => {
						const fullName = `${instructor.instructor.user.name} ${instructor.instructor.user.surname}`;
						return (
							<Fragment key={instructor.id}>
								<ListItem className={commonClasses.ListItem}>
									<Stack direction="row" flex={1}>
										<ListItemAvatar>
											<Avatar
												{...initialsAvatarProps(
													fullName
												)}
											/>
										</ListItemAvatar>
										<ListItemText
											primary={fullName}
											secondary={
												<>
													{
														instructor.assignedCoursesCount
													}{" "}
													kursów (
													{
														instructor.activeCoursesCount
													}{" "}
													aktywn
													{formatPolishWordSuffix(
														instructor.activeCoursesCount,
														["y", "e", "ych"]
													)}
													)
													<InlineDot color="secondary" />
													4.65
												</>
											}
										/>
									</Stack>

									<Button
										variant={
											selectedInstructorId ==
											instructor.id
												? "contained"
												: "outlined"
										}
										color="secondary"
										size="small"
										onClick={() =>
											updateSelectedInstructorId(
												instructor.id
											)
										}
										disabled={
											instructor.activeCoursesCount >=
												instructor.maximumConcurrentStudents ||
											!instructor.visible
										}
									>
										{selectedInstructorId == instructor.id
											? "Wybrany"
											: "Wybierz"}
									</Button>
								</ListItem>
								<Divider variant="inset" component="li" />
							</Fragment>
						);
					})}
				</List>
			) : (
				<MessagePanel
					image="/no-results.svg"
					caption="Brak instruktorów"
				/>
			)}
		</section>
	);
}
