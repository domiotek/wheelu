import {
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useState,
} from "react";
import ModalContainer, {
	ModalContext,
} from "../../components/ModalContainer/ModalContainer";
import classes from "./RideDetailsModal.module.css";
import {
	Button,
	List,
	ListItem,
	ListItemText,
	MenuItem,
	TextField,
	Typography,
} from "@mui/material";
import ButtonsBar from "../../components/ButtonsBar/ButtonsBar";
import { ScheduleService } from "../../services/Schedule";
import AuthService from "../../services/Auth";
import { DateTime } from "luxon";
import VehicleModal from "../VehicleModal/VehicleModal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { callAPI } from "../../modules/utils";
import { API } from "../../types/api";
import { RideStatus } from "../../modules/enums";
import { GetUserConfirmation } from "../../modules/features";
import InlineDot from "../../components/InlineDot/InlineDot";
import { toast } from "react-toastify";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";

interface IProps {
	ride?: App.Models.IRide;
	rideID: number;
	courseID: number;
	canAlterState: boolean;
	canChangeVehicle: boolean;
}

export default function RideDetailsModal({
	ride: incomingRide,
	rideID,
	courseID,
	canAlterState,
	canChangeVehicle,
}: IProps) {
	const [modalContent, setModalContent] = useState<JSX.Element | null>(null);
	const [changingVehicle, setChangingVehicle] = useState<boolean>(false);
	const [selectedVehicleID, setSelectedVehicleID] = useState<number>(-1);
	const [ride, setRide] = useState<App.Models.IRide | null>(
		incomingRide ?? null
	);

	const { setHostClassName, closeModal } = useContext(ModalContext);
	const qClient = useQueryClient();

	const { data: fetchedRide, failureCount } = useQuery<
		API.Courses.GetCourseRide.IResponse,
		API.Courses.GetCourseRide.IEndpoint["error"]
	>({
		queryKey: ["Courses", "#", courseID, "Rides", "#", rideID],
		queryFn: () =>
			callAPI<API.Courses.GetCourseRide.IEndpoint>(
				"GET",
				"/api/v1/courses/:courseID/rides/:rideID",
				null,
				{ courseID, rideID }
			),
		retry: true,
		staleTime: 60000,
		enabled: incomingRide == null,
	});

	useEffect(() => {
		if (failureCount == 1) {
			toast.error("Nie udało się pobrać informacji o jeździe");
		}

		if (fetchedRide) {
			setRide(fetchedRide);
			setSelectedVehicleID(fetchedRide.vehicle.id);
		}
	}, [fetchedRide, failureCount]);

	const { data: vehicles, isPending } = useQuery<
		API.Vehicles.GetAllOfSchool.IResponse,
		API.Vehicles.GetAllOfSchool.IEndpoint["error"]
	>({
		queryKey: [
			"Schools",
			"#",
			ride?.course.schoolId,
			"Vehicles",
			ride?.slot?.startTime,
			"-",
			ride?.slot?.endTime,
		],
		queryFn: () =>
			callAPI<API.Vehicles.GetAllOfSchool.IEndpoint>(
				"GET",
				"/api/v1/schools/:schoolID/vehicles",
				{ after: ride!.slot!.startTime, before: ride!.slot!.endTime },
				{ schoolID: ride!.course.schoolId }
			),
		retry: true,
		staleTime: 60000,
		enabled: canChangeVehicle && ride != null,
	});

	const setStateMutation = useMutation<
		null,
		API.Courses.SetRideState.IEndpoint["error"],
		API.Courses.SetRideState.IRequest["newStatus"]
	>({
		mutationFn: (status) => {
			return callAPI<API.Courses.SetRideState.IEndpoint>(
				"PUT",
				"/api/v1/courses/:courseID/rides/:rideID",
				{ newStatus: status },
				{ courseID: ride!.course.id, rideID: ride!.id }
			);
		},
		onSuccess: () => {
			closeModal();
			qClient.invalidateQueries({
				queryKey: ["Courses", "#", ride!.course.id],
			});
			toast.success("Pomyślnie zmieniono status jazdy.");
		},
		onError: () => toast.error("Nie udało się zmienić statusu jazdy."),
	});

	const changeVehicleMutation = useMutation<
		null,
		API.Courses.SetRideVehicle.IEndpoint["error"]
	>({
		mutationFn: () => {
			return callAPI<API.Courses.SetRideVehicle.IEndpoint>(
				"PUT",
				"/api/v1/courses/:courseID/rides/:rideID/vehicle",
				{ newVehicleId: selectedVehicleID },
				{ courseID: ride!.course.id, rideID: ride!.id }
			);
		},
		onSuccess: () => {
			closeModal();
			qClient.invalidateQueries({
				queryKey: ["Courses", "#", ride!.course.id, "Rides"],
			});
			toast.success("Pomyślnie przypisano pojazd do jazdy.");
		},
		onError: () => toast.error("Nie udało się zmienić pojazdu."),
	});

	useLayoutEffect(() => {
		setHostClassName(classes.Modal);
	}, []);

	const startTime = useMemo(() => {
		return DateTime.fromISO(ride?.startTime ?? ride?.slot?.startTime!);
	}, [ride]);

	const endTime = useMemo(() => {
		return DateTime.fromISO(ride?.endTime ?? ride?.slot?.endTime!);
	}, [ride]);

	if (!ride) return <LoadingScreen />;

	return (
		<div className={classes.Content}>
			<Typography variant="h5">Szczegóły jazdy</Typography>
			<ButtonsBar className={classes.ToolBar}>
				{ride.status == RideStatus.Ongoing && canAlterState && (
					<Button
						color="success"
						variant="outlined"
						size="small"
						onClick={() =>
							setStateMutation.mutate(RideStatus.Finished)
						}
					>
						Zakończ
					</Button>
				)}
				{ride.status == RideStatus.Planned && !changingVehicle && (
					<>
						{canAlterState && (
							<Button
								color="error"
								variant="outlined"
								size="small"
								onClick={async () => {
									if (
										!(await GetUserConfirmation(
											setModalContent,
											{
												header: "Czy na pewno chcesz anulować tę jazdę?",
												message:
													"Akcja ta jest nieodwracalna, natomiast dalej będzie możliwe zaplanowanie nowej jazdy.",
											}
										))
									)
										return;

									setStateMutation.mutate(
										RideStatus.Canceled
									);
								}}
							>
								Anuluj jazdę
							</Button>
						)}
						{canChangeVehicle && (
							<Button
								color="secondary"
								variant="outlined"
								size="small"
								onClick={() => setChangingVehicle(true)}
							>
								Zmień pojazd
							</Button>
						)}
					</>
				)}
			</ButtonsBar>
			<List>
				<ListItem divider>
					<ListItemText
						primary="Status"
						secondary={ScheduleService.translateRideStatus(
							ride.status
						)}
					/>
				</ListItem>
				<ListItem divider>
					<ListItemText
						primary={startTime.toFormat("dd/LL/yyyy")}
						secondary={`${startTime.toFormat(
							"HH:mm"
						)} - ${endTime.toFormat("HH:mm")} (${
							endTime.diff(startTime, ["hour"]).hours
						}h)`}
					/>
				</ListItem>
				<ListItem divider>
					<ListItemText
						primary="Instruktor"
						secondary={AuthService.getUserFullName(
							ride.course.instructor
						)}
					/>
				</ListItem>
				<ListItem divider>
					<ListItemText
						primary="Kursant"
						secondary={AuthService.getUserFullName(
							ride.course.student
						)}
					/>
				</ListItem>
				<ListItem divider>
					<ListItemText
						primary="Typ"
						secondary={ride.exam ? "Egzamin" : "Jazda"}
					/>
				</ListItem>
				<ListItem divider>
					{!changingVehicle ? (
						<>
							<ListItemText
								primary="Pojazd"
								secondary={`${ride.vehicle.model} #${ride.vehicle.plate}`}
							/>
							<Button
								color="secondary"
								variant="outlined"
								onClick={() =>
									setModalContent(
										<VehicleModal
											vehicleID={ride.vehicle.id}
											schoolID={ride.course.schoolId}
											baseQuery={[
												"Schools",
												ride.course.schoolId,
												"Vehicles",
											]}
											allowEdit={false}
											mode="update"
										/>
									)
								}
							>
								Zobacz
							</Button>
						</>
					) : (
						<div className={classes.ChangingVehicleForm}>
							<TextField
								select
								color="secondary"
								required
								size="small"
								label="Wybierz pojazd"
								value={selectedVehicleID}
								onChange={(ev) =>
									setSelectedVehicleID(
										parseInt(ev.target.value)
									)
								}
							>
								{isPending && (
									<MenuItem disabled>
										Pobieranie pojazdów...
									</MenuItem>
								)}
								{vehicles?.map((vehicle) => (
									<MenuItem
										key={vehicle.id}
										value={vehicle.id}
									>
										{vehicle.model}{" "}
										<InlineDot color="secondary" /> #
										{vehicle.plate}
									</MenuItem>
								))}
							</TextField>

							<Button
								color="secondary"
								onClick={() => setChangingVehicle(false)}
								disabled={changeVehicleMutation.isPending}
							>
								Anuluj
							</Button>
							<Button
								variant="contained"
								color="secondary"
								onClick={() => changeVehicleMutation.mutate()}
								disabled={changeVehicleMutation.isPending}
							>
								Zapisz
							</Button>
						</div>
					)}
				</ListItem>
			</List>

			<ButtonsBar className={classes.ButtonsBar}>
				<Button
					color="secondary"
					variant="contained"
					onClick={closeModal}
				>
					Ok
				</Button>
			</ButtonsBar>

			<ModalContainer
				show={modalContent != null}
				onClose={() => setModalContent(null)}
			>
				{modalContent}
			</ModalContainer>
		</div>
	);
}
