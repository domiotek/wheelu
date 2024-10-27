import {
	Button,
	Divider,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	Paper,
	Typography,
} from "@mui/material";
import classes from "./ExamsView.module.css";
import InlineDot from "../../../../components/InlineDot/InlineDot";
import { Star } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { callAPI } from "../../../../modules/utils";
import { useCallback, useContext } from "react";
import { CoursePageContext } from "../../CoursePage";
import { API } from "../../../../types/api";
import LoadingScreen from "../../../../components/LoadingScreen/LoadingScreen";
import MessagePanel from "../../../../components/MessagePanel/MessagePanel";
import { ExamService } from "../../../../services/Exam";
import { DateTimeFormatter } from "../../../../modules/formatters";
import { ExamState } from "../../../../modules/enums";
import AlertPanel from "./components/AlertPanel";
import { AppContext } from "../../../../App";
import ExamDetailsModal from "../../../../modals/ExamDetailsModal/ExamDetailsModal";

export default function ExamsView() {
	const { setModalContent } = useContext(AppContext);

	const {
		course,
		baseQuery,
		canEdit,
		role,
		ranOutOfHours,
		passedExam,
		filledProgress,
	} = useContext(CoursePageContext);

	const { data, isPending } = useQuery<
		API.Courses.GetCourseExams.IResponse,
		API.Courses.GetCourseExams.IEndpoint["error"]
	>({
		queryKey: baseQuery.concat(["Exams"]),
		queryFn: () =>
			callAPI<API.Courses.GetCourseExams.IEndpoint>(
				"GET",
				"/api/v1/courses/:courseID/exams",
				null,
				{ courseID: course!.id }
			),
		retry: false,
		staleTime: 60000,
		enabled: course != null,
	});

	const openExamModal = useCallback((exam: App.Models.IShortExam) => {
		setModalContent(
			<ExamDetailsModal courseID={exam.courseId} examID={exam.id} />
		);
	}, []);

	return (
		<div className={classes.Wrapper}>
			<Typography variant="h6">Egzamin wewnętrzny</Typography>
			<Divider />

			{!passedExam && !ranOutOfHours && (
				<AlertPanel
					course={course!}
					canEdit={canEdit}
					role={role}
					filledCourseProgress={filledProgress}
				/>
			)}

			{isPending && <LoadingScreen />}

			{data?.length == 0 && !isPending ? (
				<MessagePanel image="/driver.svg" caption="Brak egzaminów" />
			) : (
				<List className={classes.ExamList}>
					{data?.map((exam, i) => (
						<Paper key={exam.id} component={ListItem}>
							<ListItemAvatar>
								<Star
									color={ExamService.getExamListAccentColorFromState(
										exam.state
									)}
									fontSize="large"
								/>
							</ListItemAvatar>
							<ListItemText
								primary={`Podejście #${i + 1}`}
								secondary={
									<>
										{ExamService.formatExamState(
											exam.state
										)}{" "}
										<InlineDot color="secondary" />{" "}
										{DateTimeFormatter.format(exam.date)}{" "}
										{exam.state >= ExamState.Passed && (
											<>
												<InlineDot color="secondary" />{" "}
												{exam.passedItems}/
												{exam.totalItems}
											</>
										)}
									</>
								}
							/>
							{exam.state >= ExamState.Passed && (
								<Button
									variant="outlined"
									color="secondary"
									size="small"
									onClick={() => openExamModal(exam)}
								>
									Zobacz
								</Button>
							)}
						</Paper>
					))}
				</List>
			)}
		</div>
	);
}
