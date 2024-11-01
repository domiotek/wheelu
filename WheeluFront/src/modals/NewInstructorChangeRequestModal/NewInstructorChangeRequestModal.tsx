import { useContext, useLayoutEffect, useMemo, useState } from "react";
import { ModalContext } from "../../components/ModalContainer/ModalContainer";
import classes from "./NewInstructorChangeRequestModal.module.css";
import {
	Button,
	CircularProgress,
	Divider,
	List,
	ListItem,
	ListItemText,
	TextField,
	Typography,
} from "@mui/material";
import ButtonsBar from "../../components/ButtonsBar/ButtonsBar";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API } from "../../types/api";
import { callAPI, formatPolishWordSuffix } from "../../modules/utils";
import InlineDot from "../../components/InlineDot/InlineDot";
import { toast } from "react-toastify";

interface IProps {
	course: App.Models.ICourse;
}

export default function NewInstructorChangeRequestModal({ course }: IProps) {
	const [selectedInstructor, setSelectedInstructor] = useState<number | null>(
		null
	);
	const [note, setNote] = useState<string>("");

	const { setHostClassName, closeModal, setOnCoverCloseAttemptListener } =
		useContext(ModalContext);
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

	const addRequestMutation = useMutation<
		null,
		API.Courses.ChangeInstructorRequest.Post.IEndpoint["error"],
		API.Courses.ChangeInstructorRequest.Post.IRequest
	>({
		mutationFn: (data) =>
			callAPI<API.Courses.ChangeInstructorRequest.Post.IEndpoint>(
				"POST",
				"/api/v1/courses/:courseID/instructor-change-request",
				data,
				{ courseID: course.id }
			),
		onSuccess: () => {
			qClient.invalidateQueries({
				queryKey: [
					"Courses",
					"#",
					course.id,
					"instructor-change-request",
				],
			});
			closeModal();
			toast.success("Poprawnie wysłano wniosek");
		},
		onError: () => toast.error("Nie udało się wysłać wniosku."),
	});

	const instructors = useMemo(() => {
		return (
			data?.filter(
				(instructor) =>
					instructor.allowedCategories.includes(course.category) &&
					instructor.id != course.instructorId
			) ?? []
		);
	}, [data, course]);

	useLayoutEffect(() => {
		setHostClassName(classes.Modal);
		setOnCoverCloseAttemptListener(() => !addRequestMutation.isPending);
	}, []);
	return (
		<div className={classes.Host}>
			<Typography variant="h5">Złóż wniosek</Typography>

			<div className={classes.Content}>
				<div>
					<Typography variant="overline" gutterBottom>
						Dostosuj preferencje
					</Typography>
					<Divider />
				</div>

				<List dense>
					<ListItem divider>
						<ListItemText>Dowolny</ListItemText>

						<Button
							size="small"
							variant={
								selectedInstructor === null
									? "contained"
									: "outlined"
							}
							color="secondary"
							onClick={() => setSelectedInstructor(null)}
							disabled={addRequestMutation.isPending}
						>
							{selectedInstructor === null
								? "Wybrany"
								: "Wybierz"}
						</Button>
					</ListItem>

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
											{instructor.assignedCourses.length}{" "}
											kurs
											{formatPolishWordSuffix(
												instructor.assignedCourses
													.length,
												["", "y", "ów"]
											)}{" "}
											({activeCoursesCount} aktywn
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
									disabled={addRequestMutation.isPending}
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
				</List>

				<TextField
					className={classes.TextArea}
					label="Uzasadnienie"
					placeholder="Opowiedz krótko, czym motywowany jest ten wniosek."
					required
					inputProps={{ maxLength: 255 }}
					color="secondary"
					multiline
					maxRows={4}
					value={note}
					onChange={(ev) => setNote(ev.target.value)}
					helperText={`${note.length} / 255`}
					disabled={addRequestMutation.isPending}
				/>
			</div>

			<ButtonsBar>
				<Button
					onClick={closeModal}
					disabled={addRequestMutation.isPending}
				>
					Anuluj
				</Button>
				<Button
					variant="contained"
					disabled={
						note == "" || isFetching || addRequestMutation.isPending
					}
					onClick={() =>
						addRequestMutation.mutate({
							instructorId: selectedInstructor ?? undefined,
							note,
						})
					}
				>
					Wyślij
				</Button>
			</ButtonsBar>
		</div>
	);
}
