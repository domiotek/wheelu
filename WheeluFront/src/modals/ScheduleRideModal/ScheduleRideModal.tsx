import {
	useCallback,
	useContext,
	useLayoutEffect,
	useMemo,
	useState,
} from "react";
import ModalContainer, {
	ModalContext,
} from "../../components/ModalContainer/ModalContainer";
import classes from "./ScheduleRideModal.module.css";
import {
	Button,
	ButtonBase,
	Divider,
	List,
	ListItem,
	ListItemText,
	MenuItem,
	TextField,
	Typography,
} from "@mui/material";
import ButtonsBar from "../../components/ButtonsBar/ButtonsBar";
import InlineDot from "../../components/InlineDot/InlineDot";
import ScheduleModal from "../ScheduleModal/ScheduleModal";
import { DateTimeFormatter } from "../../modules/formatters";
import AuthService from "../../services/Auth";
import { CourseCategoriesMapping } from "../../modules/constants";
import { callAPI, formatPolishWordSuffix } from "../../modules/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API } from "../../types/api";

interface IProps {
	course: App.Models.ICourse;
	type: "ride" | "exam";
}

export default function ScheduleRideModal({ course, type }: IProps) {
	const [modalOpen, setModalOpen] = useState(false);
	const [slot, setSlot] = useState<App.Models.IScheduleSlot | null>(null);
	const [vehicleID, setVehicleID] = useState<number | "">("");

	const { setHostClassName, closeModal } = useContext(ModalContext);

	const qClient = useQueryClient();

	const categoryName = useMemo(() => {
		return CourseCategoriesMapping.find((cat) => cat.id == course.category)
			?.name;
	}, []);

	const { data: vehicles, isPending } = useQuery<
		API.Vehicles.GetAllOfSchool.IResponse,
		API.Vehicles.GetAllOfSchool.IEndpoint["error"]
	>({
		queryKey: [
			"Schools",
			"#",
			course.school.id,
			"Vehicles",
			slot?.startTime,
			"-",
			slot?.endTime,
		],
		queryFn: () =>
			callAPI<API.Vehicles.GetAllOfSchool.IEndpoint>(
				"GET",
				"/api/v1/schools/:schoolID/vehicles",
				{ after: slot!.startTime, before: slot!.endTime },
				{ schoolID: course.school.id }
			),
		retry: true,
		staleTime: 60000,
		enabled: slot != undefined,
	});

	const successCallback = useCallback(() => {
		closeModal();
		qClient.invalidateQueries({
			queryKey: ["Courses", "#", course.id],
		});
	}, []);

	const createRide = useMutation<
		null,
		API.Courses.CreateRide.IEndpoint["error"],
		API.Courses.CreateRide.IRequest
	>({
		mutationFn: (data) => {
			return callAPI<API.Courses.CreateRide.IEndpoint>(
				"POST",
				"/api/v1/courses/:courseID/rides",
				{
					slotID: data.slotID,
					vehicleID: data.vehicleID,
				},
				{ courseID: course.id }
			);
		},
		onSuccess: successCallback,
	});

	const createExam = useMutation<
		null,
		API.Courses.CreateExam.IEndpoint["error"],
		API.Courses.CreateExam.IRequest
	>({
		mutationFn: (data) => {
			return callAPI<API.Courses.CreateExam.IEndpoint>(
				"POST",
				"/api/v1/courses/:courseID/exams",
				{
					slotID: data.slotID,
					vehicleID: data.vehicleID,
				},
				{ courseID: course.id }
			);
		},
		onSuccess: successCallback,
	});

	const executeMutation = useCallback(() => {
		if (!slot || vehicleID == "") return;

		const request = {
			slotID: slot.id,
			vehicleID,
		};

		if (type == "ride") createRide.mutate(request);
		else createExam.mutate(request);
	}, [slot, vehicleID]);

	useLayoutEffect(() => {
		setHostClassName(classes.Modal);
	}, []);

	return (
		<div className={classes.Content}>
			<Typography variant="h4">
				Zaplanuj {type == "ride" ? "jazdę" : "egzamin"}
			</Typography>

			<div className={classes.Form}>
				<List dense>
					<ListItem className={classes.PeopleListItem} divider>
						<ListItemText
							primary="Instruktor"
							secondary={AuthService.getUserFullName(
								course.instructor
							)}
						/>
						<Divider className={classes.Divider} />
						<ListItemText
							primary="Kursant"
							secondary={AuthService.getUserFullName(
								course.student
							)}
						/>
					</ListItem>
					<ListItem divider>
						<ListItemText
							primary="Kurs"
							secondary={
								<>
									Kategoria {categoryName}
									<InlineDot color="secondary" />
									{course.usedHours}/{course.hoursCount}{" "}
									godzin
								</>
							}
						/>
					</ListItem>
					<ListItem>
						<ListItemText
							primary="Rodzaj"
							secondary={type == "ride" ? "Jazda" : "Egzamin"}
						/>
					</ListItem>
				</List>

				<Typography>Wybierz termin</Typography>

				<ButtonBase
					className={classes.TimeSlot}
					sx={{
						"--time-slot-bg": (theme) =>
							theme.palette.secondary.light,
					}}
					onClick={() => setModalOpen(true)}
				>
					{slot ? (
						<>
							<Typography>
								{DateTimeFormatter.formatAdaptiveFriendly(
									slot.startTime
								)}
							</Typography>
							<Typography variant="body2">
								{DateTimeFormatter.format(
									slot.startTime,
									"HH:mm"
								)}{" "}
								-{" "}
								{DateTimeFormatter.format(
									slot.endTime,
									"HH:mm"
								)}
							</Typography>
						</>
					) : (
						<Typography variant="caption">
							Nie wybrano terminu
						</Typography>
					)}
				</ButtonBase>

				<Typography>Wybierz pojazd</Typography>

				<TextField
					className={classes.VehicleSelector}
					name="vehicleID"
					size="small"
					color="secondary"
					label="Pojazd"
					select
					value={vehicleID}
					onChange={(ev) => setVehicleID(parseInt(ev.target.value))}
				>
					{vehicles?.map((vehicle) => (
						<MenuItem key={vehicle.id} value={vehicle.id}>
							{vehicle.model} <InlineDot color="secondary" /> #
							{vehicle.plate}
						</MenuItem>
					))}
					{!vehicles?.length ? (
						<MenuItem disabled>
							{slot != null && !isPending
								? "Brak pojazdów"
								: "Wybierz termin"}
						</MenuItem>
					) : undefined}
				</TextField>

				<ButtonsBar className={classes.ButtonsBar}>
					<Button onClick={closeModal}>Anuluj</Button>
					<Button
						variant="contained"
						onClick={executeMutation}
						disabled={
							createRide.isPending ||
							vehicleID == "" ||
							slot == null
						}
					>
						Potwierdź
					</Button>
				</ButtonsBar>
			</div>
			<ModalContainer
				show={modalOpen}
				onClose={() => setModalOpen(false)}
			>
				<ScheduleModal
					instructorID={course.instructorId}
					allowAlter={false}
					mode="pick"
					onPick={(slot) => setSlot(slot)}
				/>
			</ModalContainer>
		</div>
	);
}
