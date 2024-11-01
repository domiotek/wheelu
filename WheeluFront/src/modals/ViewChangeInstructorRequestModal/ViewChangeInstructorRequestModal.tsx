import { useContext, useLayoutEffect, useMemo } from "react";
import { ModalContext } from "../../components/ModalContainer/ModalContainer";
import {
	Button,
	List,
	ListItem,
	ListItemText,
	TextField,
	Typography,
} from "@mui/material";
import classes from "./ViewChangeInstructorRequestModal.module.css";
import CourseService from "../../services/Course";
import AuthService from "../../services/Auth";
import { CourseCategoriesMapping } from "../../modules/constants";
import { useNavigate } from "react-router-dom";
import { DateTimeFormatter } from "../../modules/formatters";
import { OpenInNew } from "@mui/icons-material";
import ButtonsBar from "../../components/ButtonsBar/ButtonsBar";
import { RequestStatus } from "../../modules/enums";
import { useMutation } from "@tanstack/react-query";
import { callAPI } from "../../modules/utils";
import { API } from "../../types/api";
import { toast } from "react-toastify";

interface IProps {
	request: App.Models.IInstructorChangeRequest;
	canEdit: boolean;
	invalidateQuery: () => void;
}

export default function ViewChangeInstructorRequestModal({
	request,
	canEdit,
	invalidateQuery,
}: IProps) {
	const { setHostClassName, closeModal } = useContext(ModalContext);

	const navigate = useNavigate();

	const categoryName = useMemo(() => {
		return CourseCategoriesMapping.filter(
			(cat) => cat.id == request.course.category
		)[0].name;
	}, []);

	const updateStatusMutation = useMutation<
		null,
		API.Courses.ChangeInstructorRequest.PutStatus.IEndpoint["error"],
		RequestStatus.Rejected | RequestStatus.Resolved
	>({
		mutationFn: (status) =>
			callAPI<API.Courses.ChangeInstructorRequest.PutStatus.IEndpoint>(
				"PUT",
				"/api/v1/schools/:schoolID/instructor-change-requests/:requestID",
				{ newStatus: status },
				{ schoolID: request.course.schoolId, requestID: request.id }
			),
		onSuccess: () => {
			invalidateQuery();
			closeModal();
			toast.success("Poprawnie rozpatrzono wniosek");
		},
		onError: () => toast.error("Nie udało się rozpatrzeć wniosku."),
	});

	useLayoutEffect(() => {
		setHostClassName(classes.Modal);
	}, []);

	return (
		<div className={classes.Host}>
			<Typography variant="h5">Szczegóły wniosku</Typography>

			{request.status == RequestStatus.Pending && canEdit && (
				<ButtonsBar>
					<Button
						variant="outlined"
						color="success"
						onClick={() =>
							updateStatusMutation.mutate(RequestStatus.Resolved)
						}
						disabled={updateStatusMutation.isPending}
					>
						Zakończ
					</Button>
					<Button
						variant="outlined"
						color="error"
						onClick={() =>
							updateStatusMutation.mutate(RequestStatus.Rejected)
						}
						disabled={updateStatusMutation.isPending}
					>
						Odrzuć
					</Button>
				</ButtonsBar>
			)}

			<div className={classes.Content}>
				<List>
					<ListItem divider>
						<ListItemText
							primary="Status (ostatnia zmiana)"
							secondary={
								CourseService.formatRequestStatus(
									request.status
								) +
								` (${DateTimeFormatter.format(
									request.lastStatusChange
								)})`
							}
						/>
					</ListItem>

					<ListItem divider>
						<ListItemText
							primary="Wnioskodawca"
							secondary={
								AuthService.getUserFullName(request.requestor) +
								` (${CourseService.formatRequestorType(
									request.requestorType
								)})`
							}
						/>
					</ListItem>
					<ListItem divider>
						<ListItemText
							primary="Kurs"
							secondary={`Kategoria ${categoryName}`}
						/>
						<Button
							variant="outlined"
							color="secondary"
							onClick={() => {
								closeModal();
								navigate(`/courses/${request.course.id}`);
							}}
							endIcon={<OpenInNew />}
						>
							Zobacz
						</Button>
					</ListItem>
					<ListItem divider>
						<ListItemText
							primary="Preferowany instruktor"
							secondary={
								request.requestedInstructor
									? AuthService.getUserFullName(
											request.requestedInstructor
												.instructor.user
									  )
									: "Brak"
							}
						/>
					</ListItem>
					<ListItem divider>
						<ListItemText
							primary="Utworzony"
							secondary={DateTimeFormatter.format(
								request.requestedAt
							)}
						/>
					</ListItem>
				</List>

				<TextField
					label="Uzasadnienie"
					disabled
					value={request.note}
					InputLabelProps={{ shrink: true }}
					multiline
					maxRows={4}
					minRows={3}
				/>
			</div>
			<ButtonsBar>
				<Button onClick={closeModal} variant="contained">
					Ok
				</Button>
			</ButtonsBar>
		</div>
	);
}
