import { useContext, useLayoutEffect, useMemo, useState } from "react";
import { ModalContext } from "../../components/ModalContainer/ModalContainer";
import classes from "./ChangeCourseInstructorModal.module.css";
import {
	Alert,
	Button,
	CircularProgress,
	List,
	ListItem,
	ListItemText,
	Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API } from "../../types/api";
import { callAPI, formatPolishWordSuffix } from "../../modules/utils";
import { App } from "../../types/app";
import InlineDot from "../../components/InlineDot/InlineDot";
import MessagePanel from "../../components/MessagePanel/MessagePanel";
import ButtonsBar from "../../components/ButtonsBar/ButtonsBar";
import { toast } from "react-toastify";

interface IProps {
	course: App.Models.ICourse;
}

export default function ChangeCourseInstructorModal({ course }: IProps) {
	const [selectedInstructor, setSelectedInstructor] = useState<number | null>(
		null
	);

	const { setHostClassName, closeModal } = useContext(ModalContext);

	const qClient = useQueryClient();

	const { data, isFetching } = useQuery<
		API.Instructors.GetAllOfSchool.IResponse,
		API.Instructors.GetAllOfSchool.IEndpoint["error"]
	>({
		queryKey: ["Schools", "#", course.school.id, "Instructors"],
		queryFn: () =>
			callAPI<API.Instructors.GetAllOfSchool.IEndpoint>(
				"GET",
				"/api/v1/schools/:schoolID/instructors",
				null,
				{ schoolID: course.school.id }
			),
		retry: true,
		staleTime: 60000,
	});

	const changeInstructorMutation = useMutation<
		null,
		API.Courses.ChangeInstructor.IEndpoint["error"]
	>({
		mutationFn: () => {
			if (selectedInstructor == null)
				return new Promise<null>((r) => r(null));

			return callAPI<API.Courses.ChangeInstructor.IEndpoint>(
				"PUT",
				"/api/v1/courses/:courseID/instructor",
				{ instructorId: selectedInstructor },
				{ courseID: course.id }
			);
		},
		onSuccess: () => {
			qClient.invalidateQueries({
				queryKey: ["Courses", "#", course.id],
			});
			closeModal();
			toast.success("Poprawnie zmieniono instruktora.");
		},
		onError: () => toast.error("Nie udało się zmienić instruktora."),
	});

	const instructors = useMemo(() => {
		return (
			data?.filter(
				(instructor) =>
					instructor.allowedCategories.includes(course.category) &&
					instructor.id != course.schoolInstructorId
			) ?? []
		);
	}, [data, course]);

	useLayoutEffect(() => {
		setHostClassName(classes.Modal);
	}, []);
	return (
		<div className={classes.Host}>
			<Typography variant="h5">Zmień instruktora</Typography>
			<Alert className={classes.Alert} severity="info">
				Możesz przypisać instruktora, nawet jeśli jego wybór zaskutkuje
				przekroczeniem jego maksymalnej ilości kursantów.
			</Alert>
			<List className={classes.List} dense>
				{instructors.map((instructor) => {
					const activeCoursesCount =
						instructor.assignedCourses.filter(
							(c) => !c.archived
						).length;
					return (
						<ListItem key={instructor.id} divider>
							<ListItemText
								primary={
									<>
										{instructor.instructor.user.name}{" "}
										{instructor.instructor.user.surname}
									</>
								}
								secondary={
									<>
										Łącznie{" "}
										{instructor.assignedCourses.length} kurs
										{formatPolishWordSuffix(
											instructor.assignedCourses.length,
											["", "y", "ów"]
										)}
										<InlineDot color="secondary" />
										{activeCoursesCount} /{" "}
										{instructor.maximumConcurrentStudents}{" "}
										możliw
										{formatPolishWordSuffix(
											instructor.maximumConcurrentStudents,
											["y", "e", "ych"]
										)}
									</>
								}
							/>
							<Button
								size="small"
								variant={
									selectedInstructor === instructor.id
										? "contained"
										: "outlined"
								}
								color="secondary"
								onClick={() =>
									setSelectedInstructor(instructor.id)
								}
							>
								{selectedInstructor === instructor.id
									? "Wybrany"
									: "Wybierz"}
							</Button>
						</ListItem>
					);
				})}

				{isFetching && (
					<div className={classes.ProgressRingWrapper}>
						<CircularProgress />
					</div>
				)}

				{instructors.length == 0 && (
					<MessagePanel
						className={classes.NoInstructorsMessage}
						image="/no-results.svg"
						caption="Brak instruktorów"
					/>
				)}
			</List>

			<ButtonsBar>
				<Button onClick={closeModal}>Anuluj</Button>
				<Button
					variant="contained"
					onClick={() => changeInstructorMutation.mutate()}
					disabled={selectedInstructor === null}
				>
					Potwierdź
				</Button>
			</ButtonsBar>
		</div>
	);
}
