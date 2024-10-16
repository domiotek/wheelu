import { Alert, AlertTitle, Button } from "@mui/material";
import classes from "../CoursePage.module.css";
import { App } from "../../../types/app";
import { useCallback, useContext, useMemo } from "react";
import CourseService from "../../../services/Course";
import { DateTime } from "luxon";
import { DateTimeFormatter } from "../../../modules/formatters";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { callAPI } from "../../../modules/utils";
import { API } from "../../../types/api";
import { toast } from "react-toastify";
import { RideStatus } from "../../../modules/enums";
import { AppContext } from "../../../App";
import RideDetailsModal from "../../../modals/RideDetailsModal/RideDetailsModal";
import ScheduleRideModal from "../../../modals/ScheduleRideModal/ScheduleRideModal";

interface IProps {
	course: App.Models.ICourse;
	canEdit: boolean;
	role: "student" | "instructor" | "other";
}

export default function AlertPanel({ course, canEdit, role }: IProps) {
	const { setModalContent } = useContext(AppContext);
	const qClient = useQueryClient();

	const setRideStateMutation = useMutation<
		null,
		API.Courses.SetRideState.IEndpoint["error"],
		{
			status: API.Courses.SetRideState.IRequest["newStatus"];
			rideID: number;
		}
	>({
		mutationFn: (data) => {
			return callAPI<API.Courses.SetRideState.IEndpoint>(
				"PUT",
				"/api/v1/courses/:courseID/rides/:rideID",
				{ newStatus: data.status },
				{ courseID: course!.id, rideID: data.rideID }
			);
		},
		onSuccess: () => {
			qClient.invalidateQueries({
				queryKey: ["Courses", "#", course!.id],
			});

			toast.success("Pomyślnie zmieniono status jazdy.");
		},
		onError: () => toast.error("Nie udało się zmienić statusu jazdy."),
	});

	const showRideModal = useCallback(() => {
		setModalContent(
			<RideDetailsModal
				rideID={course!.nextRide!.id}
				courseID={course!.id}
				canAlterState={canEdit}
				canChangeVehicle={canEdit && role == "instructor"}
			/>
		);
	}, []);

	const showSchedulerModal = useCallback(() => {
		setModalContent(<ScheduleRideModal course={course} />);
	}, []);

	const alertPanel = useMemo(() => {
		let alertDef: App.UI.CoursePage.IAlertDef = {
			title: "",
			content: "",
			variant: "info",
		};

		const t = CourseService.getCourseAlertText;

		switch (true) {
			case course.ongoingRide != undefined:
				const orStartTime = DateTime.fromISO(
					course.ongoingRide.startTime
				).toFormat("HH:mm");
				const orEndTime = DateTime.fromISO(
					course.ongoingRide.slot!.endTime
				).toFormat("HH:mm");

				alertDef.title = t("ongoingRide_title");
				alertDef.content = t("ongoingRide_content", role, [
					orStartTime,
					orEndTime,
				]);

				if (canEdit && role == "instructor")
					alertDef.action = (
						<Button
							color="inherit"
							variant="outlined"
							disabled={setRideStateMutation.isPending}
							onClick={() =>
								setRideStateMutation.mutate({
									status: RideStatus.Finished,
									rideID: course.ongoingRide!.id,
								})
							}
						>
							Zakończ
						</Button>
					);
				break;
			case course?.nextRide != undefined:
				const startTime = DateTime.fromISO(
					course.nextRide.slot!.startTime
				);
				const endTime = DateTime.fromISO(course.nextRide.slot!.endTime);
				const formatted =
					DateTimeFormatter.formatAdaptiveFriendly(startTime) +
					startTime.toFormat(" 'o' HH:mm");

				alertDef.title = t("plannedRide_title");

				if (startTime > DateTime.now()) {
					alertDef.content = t("plannedRide_future_content", role, [
						formatted,
					]);

					alertDef.action = (
						<Button
							color="inherit"
							variant="outlined"
							onClick={showRideModal}
						>
							Zobacz jazdę
						</Button>
					);
				} else if (DateTime.now() < endTime) {
					alertDef.content = t("plannedRide_start_now_content", role);
					if (canEdit && role == "instructor")
						alertDef.action = (
							<Button
								color="inherit"
								variant="outlined"
								onClick={() =>
									setRideStateMutation.mutate({
										status: RideStatus.Ongoing,
										rideID: course.nextRide!.id,
									})
								}
								disabled={setRideStateMutation.isPending}
							>
								Rozpocznij
							</Button>
						);
				} else {
					alertDef.content = t("plannedRide_past_content", role, [
						formatted,
					]);

					if (canEdit)
						alertDef.action = (
							<Button
								color="inherit"
								variant="outlined"
								onClick={() =>
									setRideStateMutation.mutate({
										status: RideStatus.Canceled,
										rideID: course.nextRide!.id,
									})
								}
								disabled={setRideStateMutation.isPending}
							>
								Anuluj
							</Button>
						);
				}

				break;
			default:
				alertDef.title = t("no_ride_title");
				alertDef.content = t("no_ride_content", role);
				if (canEdit)
					alertDef.action = (
						<Button
							color="inherit"
							variant="outlined"
							onClick={showSchedulerModal}
						>
							Zaplanuj jazdę
						</Button>
					);
		}

		return alertDef;
	}, [course]);

	return (
		<Alert
			className={classes.Alert}
			variant="outlined"
			severity={alertPanel.variant}
			action={alertPanel.action}
		>
			<AlertTitle>{alertPanel.title}</AlertTitle>
			{alertPanel.content}
		</Alert>
	);
}
