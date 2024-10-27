import { Alert, AlertTitle, Button } from "@mui/material";
import classes from "../CoursePage.module.css";
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
import { useNavigate } from "react-router-dom";

interface IProps {
	course: App.Models.ICourse;
	canEdit: boolean;
	role: "student" | "instructor" | "other";
	ranOutOfHours: boolean;
	internalExamPassed: boolean;
	filledCourseProgress: boolean;
}

export default function AlertPanel({
	course,
	canEdit,
	role,
	ranOutOfHours,
	filledCourseProgress,
	internalExamPassed,
}: IProps) {
	const { setModalContent } = useContext(AppContext);
	const qClient = useQueryClient();
	const navigate = useNavigate();

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
		setModalContent(<ScheduleRideModal course={course} type="ride" />);
	}, []);

	const alertPanel = useMemo(() => {
		let alertDef: App.UI.CoursePage.IAlertDef = {
			title: "",
			content: "",
			variant: "info",
		};

		const t = CourseService.getCourseAlertText;

		switch (true) {
			case ranOutOfHours && !internalExamPassed:
				alertDef.title = t("hoursRanOut_title", role);
				alertDef.content = t("hoursRanOut_content", role);
				alertDef.variant = "warning";
				if (role == "student")
					alertDef.action = (
						<Button
							color="inherit"
							variant="outlined"
							onClick={() =>
								navigate(`/courses/${course.id}/manage`)
							}
						>
							Dokup godziny
						</Button>
					);
				break;
			case !ranOutOfHours && internalExamPassed:
				alertDef.title = t("complete_hours_left_title", role);
				alertDef.content = t("complete_hours_left_content", role);
				alertDef.variant = "success";
				if (role == "student")
					alertDef.action = (
						<Button color="inherit" variant="outlined">
							Wypełnij ankietę
						</Button>
					);
				break;
			case ranOutOfHours && internalExamPassed:
				alertDef.title = t("complete_title", role);
				alertDef.content = t("complete_content", role);
				alertDef.variant = "success";
				if (role == "student")
					alertDef.action = (
						<Button color="inherit" variant="outlined">
							Wypełnij ankietę
						</Button>
					);
				break;
			case !internalExamPassed && filledCourseProgress:
				alertDef.title = t("examAvailable_title", role);
				alertDef.content = t("examAvailable_content", role);
				alertDef.variant = "info";
				if (canEdit)
					alertDef.action = (
						<Button color="inherit" variant="outlined">
							Zaplanuj egzamin
						</Button>
					);
				break;
			case course.ongoingRide != undefined:
				const orStartTime = DateTime.fromISO(
					course.ongoingRide.startTime
				).toFormat("HH:mm");
				const orEndTime = DateTime.fromISO(
					course.ongoingRide.slot!.endTime
				).toFormat("HH:mm");

				const isExam = course.ongoingRide.examId != undefined;
				alertDef.title = t(
					isExam ? "ongoingExam_title" : "ongoingRide_title"
				);
				alertDef.content = t(
					`ongoing${isExam ? "RideExam" : "Ride"}_content`,
					role,
					[orStartTime, orEndTime]
				);

				if (canEdit && role == "instructor")
					alertDef.action = (
						<Button
							color="inherit"
							variant="outlined"
							disabled={setRideStateMutation.isPending}
							onClick={() => {
								isExam
									? navigate(
											`/exam/${course.ongoingRide?.examId}`
									  )
									: setRideStateMutation.mutate({
											status: RideStatus.Finished,
											rideID: course.ongoingRide!.id,
									  });
							}}
						>
							{isExam ? "Kontynuuj" : "Zakończ"}
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
				const isNextRideAnExam = course.nextRide.examId != undefined;

				const rideType = isNextRideAnExam ? "Exam" : "Ride";

				alertDef.title = t(
					`planned${rideType}${isNextRideAnExam ? "_alt" : ""}_title`
				);

				if (startTime > DateTime.now()) {
					alertDef.content = t(
						`planned${rideType}_future_content`,
						role,
						[formatted]
					);

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
					alertDef.content = t(
						`planned${rideType}_start_now_content`,
						role
					);
					if (canEdit && role == "instructor")
						alertDef.action = (
							<Button
								color="inherit"
								variant="outlined"
								onClick={async () => {
									await setRideStateMutation.mutateAsync({
										status: RideStatus.Ongoing,
										rideID: course.nextRide!.id,
									});

									if (
										isNextRideAnExam &&
										!setRideStateMutation.isError
									)
										navigate(
											`/exam/${course.nextExam?.id}`
										);
								}}
								disabled={setRideStateMutation.isPending}
							>
								Rozpocznij
							</Button>
						);
				} else {
					alertDef.content = t(
						`planned${rideType}_past_content`,
						role,
						[formatted]
					);

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
