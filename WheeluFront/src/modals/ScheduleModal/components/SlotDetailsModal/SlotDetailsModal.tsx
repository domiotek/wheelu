import { useContext, useLayoutEffect, useMemo, useState } from "react";
import ModalContainer, {
	ModalContext,
} from "../../../../components/ModalContainer/ModalContainer";
import classes from "./SlotDetailsModal.module.css";
import {
	Alert,
	AlertTitle,
	Button,
	IconButton,
	List,
	ListItem,
	ListItemText,
	Tooltip,
	Typography,
} from "@mui/material";
import { FormContainer, TextFieldElement, useForm } from "react-hook-form-mui";
import ButtonsBar from "../../../../components/ButtonsBar/ButtonsBar";
import { API } from "../../../../types/api";
import { DateTime } from "luxon";
import {
	callAPI,
	formatPolishWordSuffix,
	roundMinutesToQuarters,
} from "../../../../modules/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ScheduleContext } from "../../InstructorScheduleModal";
import { Delete } from "@mui/icons-material";
import MessagePanel from "../../../../components/MessagePanel/MessagePanel";
import AuthService from "../../../../services/Auth";
import { CourseCategoriesMapping } from "../../../../modules/constants";
import { ScheduleService } from "../../../../services/Schedule";
import RideDetailsModal from "../../../RideDetailsModal/RideDetailsModal";

interface IProps {
	slot: App.Models.IScheduleSlot;
	allowEdit: boolean;
}

export default function SlotDetailsModal({ slot, allowEdit }: IProps) {
	const [showRideDetails, setShowRideDetails] = useState<boolean>(false);

	const { setHostClassName, closeModal } = useContext(ModalContext);
	const { instructorID, baseQuery } = useContext(ScheduleContext);

	const qClient = useQueryClient();

	useLayoutEffect(() => {
		setHostClassName(classes.Modal);
	}, []);

	const formContext = useForm<API.Schedule.IManageSlotRequest>({
		defaultValues: {
			startTime: DateTime.fromISO(slot.startTime).toFormat("HH:mm"),
			endTime: DateTime.fromISO(slot.endTime).toFormat("HH:mm"),
		},
	});

	const editMutation = useMutation<
		null,
		API.Schedule.EditSlot.IEndpoint["error"],
		API.Schedule.IManageSlotRequest
	>({
		mutationFn: (submitData) => {
			const initialDate = DateTime.fromISO(slot.startTime);

			const startTime = DateTime.fromISO(submitData.startTime)
				.set({
					day: initialDate.day,
					month: initialDate.month,
					year: initialDate.year,
				})
				.toUTC();
			const endTime = DateTime.fromISO(submitData.endTime)
				.set({
					day: initialDate.day,
					month: initialDate.month,
					year: initialDate.year,
				})
				.toUTC();

			return callAPI<API.Schedule.EditSlot.IEndpoint>(
				"PUT",
				"/api/v1/instructors/:instructorID/schedule/:slotID",
				{
					startTime: startTime.toISO()!,
					endTime: endTime.toISO()!,
				},
				{ instructorID, slotID: slot.id }
			);
		},
		onSuccess: () => {
			closeModal();
			qClient.invalidateQueries({ queryKey: baseQuery });
		},
	});

	const deleteMutation = useMutation<
		null,
		API.Schedule.DeleteSlot.IEndpoint["error"]
	>({
		mutationFn: () => {
			return callAPI<API.Schedule.DeleteSlot.IEndpoint>(
				"DELETE",
				"/api/v1/instructors/:instructorID/schedule/:slotID",
				null,
				{ instructorID, slotID: slot.id }
			);
		},
		onSuccess: () => {
			closeModal();
			qClient.invalidateQueries({ queryKey: baseQuery });
		},
	});

	const timeDiff = useMemo(() => {
		const state = formContext.getValues();

		let start = DateTime.fromISO(state.startTime);
		let end = DateTime.fromISO(state.endTime);

		if (start.isValid && start.minute % 15 != 0) {
			start = roundMinutesToQuarters(start);
			formContext.setValue("startTime", start.toFormat("HH:mm"));
		}

		if (end.isValid && end.minute % 15 != 0) {
			end = roundMinutesToQuarters(end);
			formContext.setValue("endTime", end.toFormat("HH:mm"));
		}

		if (!start.isValid || !end.isValid) return null;

		const diff = end.diff(start, ["hour"]).hours;

		if (diff < 0) {
			formContext.setValue("startTime", end.toFormat("HH:mm"));
			formContext.setValue("endTime", start.toFormat("HH:mm"));
		}

		return Math.abs(diff);
	}, [formContext.watch()]);

	const categoryName = useMemo(() => {
		return CourseCategoriesMapping.find(
			(cat) => cat.id == slot.ride?.course.category
		)?.name;
	}, [slot]);

	const actionInProgress = useMemo(() => {
		return editMutation.isPending || deleteMutation.isPending;
	}, [editMutation.isPending, deleteMutation.isPending]);

	const isPastSlot = useMemo(() => {
		return DateTime.fromISO(slot.startTime) < DateTime.now();
	}, [slot]);

	const editDisabled = useMemo(() => {
		return (
			actionInProgress ||
			isPastSlot ||
			slot.ride != undefined ||
			!allowEdit
		);
	}, [actionInProgress, isPastSlot]);

	const errorAlert = useMemo(() => {
		if (!editMutation.isError && !deleteMutation.isError) return "";

		const error = editMutation.isError
			? editMutation.error
			: deleteMutation.error!;

		return (
			<Alert severity="error">
				<AlertTitle>
					Wystąpił błąd podczas przetwarzania żądania.
				</AlertTitle>
				{ScheduleService.translateErrorCode(
					error.code as API.Schedule.Errors
				)}
			</Alert>
		);
	}, [editMutation.isError, deleteMutation.isError]);

	return (
		<div className={classes.Content}>
			<Typography variant="h5">
				{slot.ride ? "Zaplanowana jazda" : "Zaplanowany termin jazdy"}
				{!isPastSlot && allowEdit && (
					<Tooltip
						title={
							slot.ride != undefined
								? "Nie możesz usunąć tego terminu, gdyż ma on przypisaną jazdę"
								: "Usuń ten termin"
						}
					>
						<span>
							<IconButton
								onClick={() => {
									editMutation.reset();
									deleteMutation.mutate();
								}}
								disabled={
									slot.ride != undefined || actionInProgress
								}
							>
								<Delete />
							</IconButton>
						</span>
					</Tooltip>
				)}
			</Typography>
			{isPastSlot && allowEdit && (
				<Alert severity="info">
					Ten termin jest tylko do odczytu, ponieważ już minął.
				</Alert>
			)}

			{errorAlert}

			<Typography variant="overline">
				{AuthService.getUserFullName(slot.instructor.instructor.user)}
			</Typography>

			<FormContainer
				FormProps={{ className: classes.Form }}
				formContext={formContext}
				onSuccess={(data) => {
					deleteMutation.reset();
					editMutation.mutate(data);
				}}
			>
				<div className={classes.InputGroup}>
					<TextFieldElement
						name="startTime"
						size="small"
						label="Początek"
						color="secondary"
						type="time"
						InputLabelProps={{ shrink: true }}
						required
						disabled={editDisabled}
					/>
					-
					<TextFieldElement
						name="endTime"
						size="small"
						label="Koniec"
						color="secondary"
						type="time"
						InputLabelProps={{ shrink: true }}
						required
						disabled={editDisabled}
					/>
				</div>
				{timeDiff && (
					<Typography variant="caption">
						{Math.floor(timeDiff)} godzin
						{formatPolishWordSuffix(Math.floor(timeDiff), [
							"a",
							"y",
							"",
						])}{" "}
						{(timeDiff % 1) * 60 > 0
							? `${(timeDiff % 1) * 60} minut`
							: ""}
					</Typography>
				)}

				<ButtonsBar>
					{allowEdit && (
						<Button type="submit" disabled={editDisabled}>
							Zapisz
						</Button>
					)}
				</ButtonsBar>
			</FormContainer>

			<Typography variant="body1">
				Przypisana jazda
				{slot.ride && (
					<Button
						size="small"
						disabled={actionInProgress}
						onClick={() => setShowRideDetails(true)}
					>
						Zobacz
					</Button>
				)}
			</Typography>

			{slot.ride ? (
				<List dense>
					<ListItem divider>
						<ListItemText
							primary="Status"
							secondary={ScheduleService.translateRideStatus(
								slot.ride.status
							)}
						/>
					</ListItem>
					<ListItem divider>
						<ListItemText
							primary="Kursant"
							secondary={AuthService.getUserFullName(
								slot.ride.course.student
							)}
						/>
					</ListItem>
					<ListItem divider>
						<ListItemText
							primary="Kurs"
							secondary={`Kategoria ${categoryName}`}
						/>
					</ListItem>
					<ListItem divider>
						<ListItemText primary="Typ" secondary="Jazda" />
					</ListItem>
				</List>
			) : (
				<MessagePanel
					className={classes.NoRideMessage}
					image="/no-results.svg"
					caption="Brak przypisanej jazdy"
				/>
			)}

			<ButtonsBar>
				<Button
					onClick={closeModal}
					variant="contained"
					disabled={actionInProgress}
				>
					Ok
				</Button>
			</ButtonsBar>
			<ModalContainer
				show={showRideDetails}
				onClose={() => setShowRideDetails(false)}
			>
				<RideDetailsModal
					rideID={slot.ride?.id!}
					courseID={slot.ride?.course.id!}
					canAlterState={false}
					canChangeVehicle={false}
				/>
			</ModalContainer>
		</div>
	);
}
