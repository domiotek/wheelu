import {
	Avatar,
	Button,
	Divider,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	Paper,
	Typography,
} from "@mui/material";
import classes from "./InstructorsView.module.css";
import commonClasses from "../Common.module.css";
import { useQuery } from "@tanstack/react-query";
import { API } from "../../../../types/api";
import { callAPI, formatPolishWordSuffix } from "../../../../modules/utils";
import { useContext } from "react";
import { PublicSchooPageContext } from "../../SchoolPage";
import LoadingScreen from "../../../../components/LoadingScreen/LoadingScreen";
import InlineDot from "../../../../components/InlineDot/InlineDot";
import MessagePanel from "../../../../components/MessagePanel/MessagePanel";
import {
	initialsAvatarProps,
	renderCategoryChips,
} from "../../../../modules/features";

export default function InstructorsView() {
	const { schoolID } = useContext(PublicSchooPageContext);

	const { data, isFetching } = useQuery<
		API.Instructors.GetAllOfSchool.IResponse,
		API.Instructors.GetAllOfSchool.IEndpoint["error"]
	>({
		queryKey: ["Schools", "#", schoolID, "Instructors"],
		queryFn: () =>
			callAPI<API.Instructors.GetAllOfSchool.IEndpoint>(
				"GET",
				"/api/v1/schools/:schoolID/instructors",
				null,
				{ schoolID }
			),
		retry: true,
		staleTime: 60000,
		enabled: schoolID != null,
	});

	return (
		<div className={commonClasses.ViewContainer}>
			<Typography variant="h5" gutterBottom>
				Instruktorzy
			</Typography>
			<Divider />

			{isFetching && <LoadingScreen />}

			{data?.length == 0 && !isFetching ? (
				<MessagePanel
					image="/no-results.svg"
					caption="Brak instruktorów"
				/>
			) : (
				<List>
					{data?.map((instructor) => {
						const activeCoursesCount =
							instructor.assignedCourses.filter(
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
												{
													instructor.instructor.user
														.name
												}{" "}
												{
													instructor.instructor.user
														.surname
												}
												<br />
												{renderCategoryChips(
													instructor.allowedCategories
												)}
											</>
										}
										secondary={
											<>
												{
													instructor.assignedCourses
														.length
												}{" "}
												kursów ({activeCoursesCount}{" "}
												aktywn
												{formatPolishWordSuffix(
													activeCoursesCount,
													["y", "e", "ych"]
												)}
												)
												<InlineDot color="secondary" />
												4.65
											</>
										}
									/>
								</div>

								<Button variant="outlined" color="secondary">
									Recenzje
								</Button>
							</Paper>
						);
					})}
				</List>
			)}
		</div>
	);
}
