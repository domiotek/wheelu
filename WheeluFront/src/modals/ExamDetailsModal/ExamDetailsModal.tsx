import {
	Button,
	List,
	ListItem,
	ListItemText,
	Typography,
} from "@mui/material";
import ButtonsBar from "../../components/ButtonsBar/ButtonsBar";
import { useContext, useEffect, useLayoutEffect, useMemo } from "react";
import { ModalContext } from "../../components/ModalContainer/ModalContainer";
import classes from "./ExamDetailsModal.module.css";
import ExamItemList from "../../components/ExamItemList/ExamItemList";
import { useQuery } from "@tanstack/react-query";
import { API } from "../../types/api";
import { callAPI } from "../../modules/utils";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";
import AuthService from "../../services/Auth";
import { DateTimeFormatter } from "../../modules/formatters";
import { ExamCriteriumState, ExamState } from "../../modules/enums";
import { ExamService } from "../../services/Exam";

interface IProps {
	courseID: number;
	examID: number;
}

export default function ExamDetailsModal({ courseID, examID }: IProps) {
	const { setHostClassName, closeModal } = useContext(ModalContext);

	const { data, isPending } = useQuery<
		API.Courses.GetCourseExam.IResponse,
		API.Courses.GetCourseExam.IEndpoint["error"]
	>({
		queryKey: ["Courses", "#", courseID, "Exams", "#", examID],
		queryFn: () =>
			callAPI<API.Courses.GetCourseExam.IEndpoint>(
				"GET",
				"/api/v1/courses/:courseID/exams/:examID",
				null,
				{ courseID, examID }
			),
		retry: true,
		staleTime: 60000,
	});

	useLayoutEffect(() => {
		setHostClassName(classes.Modal);
	}, []);

	const examStateColor = useMemo(() => {
		switch (data?.state) {
			case ExamState.Passed:
				return "success";
			case ExamState.Failed:
				return "error";
			default:
				return;
		}
	}, [data]);

	if (!data || isPending) return <LoadingScreen />;

	return (
		<div className={classes.Host}>
			<Typography variant="h5">Wynik egzaminu</Typography>

			<div className={classes.Content}>
				<List>
					<ListItem divider>
						<ListItemText
							primary="Data"
							secondary={DateTimeFormatter.format(
								data.ride.startTime
							)}
						/>
					</ListItem>
					<ListItem divider>
						<ListItemText
							primary="Kursant"
							secondary={AuthService.getUserFullName(
								data.course.student
							)}
						/>
					</ListItem>
					<ListItem divider>
						<ListItemText primary="Wynik" />
						<Typography
							variant="overline"
							color={(theme) =>
								theme.palette[examStateColor!]?.main ?? "black"
							}
						>
							{ExamService.formatExamState(data.state)}
						</Typography>
					</ListItem>
				</List>
				<ExamItemList
					className={classes.ResultHolder}
					itemGroups={data.result}
					courseCategory={data.course.category}
				/>
			</div>
			<ButtonsBar>
				<Button variant="contained" onClick={closeModal}>
					Ok
				</Button>
			</ButtonsBar>
		</div>
	);
}
