import { useContext, useLayoutEffect, useMemo } from "react";
import { ModalContext } from "../../../../components/ModalContainer/ModalContainer";
import classes from "./CreateSlotModal.module.css";
import { Alert, Button, Tooltip, Typography } from "@mui/material";
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
import { ScheduleContext } from "../../ScheduleModal";
import { ScheduleService } from "../../../../services/Schedule";

interface IProps {
	initialStartTime: DateTime;
	initialEndTime: DateTime;
}

export default function CreateSlotModal({
	initialStartTime,
	initialEndTime,
}: IProps) {
	const { setHostClassName, closeModal } = useContext(ModalContext);
	const { instructorID, baseQuery } = useContext(ScheduleContext);

	const qClient = useQueryClient();

	useLayoutEffect(() => {
		setHostClassName(classes.Modal);
	}, []);

	const formContext = useForm<API.Schedule.IManageSlotRequest>({
		defaultValues: {
			startTime: initialStartTime.toFormat("HH:mm"),
			endTime: initialEndTime.toFormat("HH:mm"),
		},
	});

	const saveChanges = useMutation<
		null,
		API.Schedule.CreateSlot.IEndpoint["error"],
		API.Schedule.IManageSlotRequest
	>({
		mutationFn: (submitData) => {
			const startTime = DateTime.fromISO(submitData.startTime)
				.set({
					day: initialStartTime.day,
					month: initialStartTime.month,
					year: initialStartTime.year,
				})
				.toUTC();
			const endTime = DateTime.fromISO(submitData.endTime)
				.set({
					day: initialStartTime.day,
					month: initialStartTime.month,
					year: initialStartTime.year,
				})
				.toUTC();

			return callAPI<API.Schedule.CreateSlot.IEndpoint>(
				"POST",
				"/api/v1/instructors/:instructorID/schedule",
				{
					startTime: startTime.toISO()!,
					endTime: endTime.toISO()!,
				},
				{ instructorID }
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

	return (
		<FormContainer
			FormProps={{ className: classes.Form }}
			formContext={formContext}
			onSuccess={(data) => saveChanges.mutate(data)}
		>
			<Typography variant="h5">Zaplanuj termin jazdy</Typography>

			<div className={classes.InputGroup}>
				<TextFieldElement
					name="startTime"
					label="Godzina początkowa"
					color="secondary"
					type="time"
					InputLabelProps={{ shrink: true }}
					required
					disabled={saveChanges.isPending}
				/>
				{timeDiff ? (
					<Typography
						className={classes.TimeDiffCaption}
						variant="caption"
					>
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
				) : (
					""
				)}

				<TextFieldElement
					name="endTime"
					label="Godzina końcowa"
					color="secondary"
					type="time"
					InputLabelProps={{ shrink: true }}
					required
					disabled={saveChanges.isPending}
				/>
			</div>

			<ButtonsBar>
				{saveChanges.isError && (
					<Tooltip
						title={ScheduleService.translateErrorCode(
							saveChanges.error.code as API.Schedule.Errors
						)}
						placement="top"
					>
						<Alert className={classes.Alert} severity="error">
							Błąd zapisu
						</Alert>
					</Tooltip>
				)}

				<Button onClick={closeModal} disabled={saveChanges.isPending}>
					Anuluj
				</Button>
				<Button
					type="submit"
					variant="contained"
					disabled={saveChanges.isPending}
				>
					Zapisz
				</Button>
			</ButtonsBar>
		</FormContainer>
	);
}
