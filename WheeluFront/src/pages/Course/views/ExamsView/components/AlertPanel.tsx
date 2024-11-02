import { Alert, AlertTitle, Button } from "@mui/material";
import classes from "../ExamsView.module.css";
import { useCallback, useContext, useMemo } from "react";
import { DateTime } from "luxon";
import { DateTimeFormatter } from "../../../../../modules/formatters";
import CourseService from "../../../../../services/Course";
import { AppContext } from "../../../../../App";
import ScheduleRideModal from "../../../../../modals/ScheduleRideModal/ScheduleRideModal";

interface IProps {
	course: App.Models.ICourse;
	canEdit: boolean;
	role: "student" | "instructor" | "other";
	filledCourseProgress: boolean;
}

export default function AlertPanel({
	course,
	canEdit,
	role,
	filledCourseProgress,
}: IProps) {
	const { setModalContent } = useContext(AppContext);

	const openSchedulerModal = useCallback(() => {
		setModalContent(<ScheduleRideModal course={course} type="exam" />);
	}, [course]);

	const alertPanel = useMemo(() => {
		let alertDef: App.UI.CoursePage.IAlertDef = {
			title: "",
			content: "",
			variant: "info",
		};

		const t = CourseService.getCourseAlertText;

		switch (true) {
			case course.ongoingRide?.examId != undefined:
				alertDef.title = t("ongoingExam_title");
				alertDef.content = t("ongoingExam_content", role);
				break;
			case course?.nextExam != undefined:
				const startTime = DateTime.fromISO(course.nextExam.date);
				const formatted =
					DateTimeFormatter.formatAdaptiveFriendly(startTime) +
					startTime.toFormat(" 'o' HH:mm");

				alertDef.title = t("plannedExam_title");
				alertDef.content = t("plannedExam_content", role, [formatted]);
				break;
			case !filledCourseProgress:
				alertDef.title = t("examSoftBlock_title", role);
				alertDef.content = t("examSoftBlock_content", role);
				if (canEdit && role == "instructor")
					alertDef.action = (
						<Button
							color="inherit"
							variant="outlined"
							onClick={openSchedulerModal}
						>
							Zaplanuj egzamin
						</Button>
					);
				break;
			default:
				alertDef.title = t("examAvailable_title", role);
				alertDef.content = t("examAvailable_content", role);
				if (canEdit)
					alertDef.action = (
						<Button
							color="inherit"
							variant="outlined"
							onClick={openSchedulerModal}
						>
							Zaplanuj egzamin
						</Button>
					);
				break;
		}

		return alertDef;
	}, [course]);

	return (
		<Alert
			className={classes.Alert}
			severity="info"
			action={alertPanel.action}
		>
			<AlertTitle>{alertPanel.title}</AlertTitle>
			{alertPanel.content}
		</Alert>
	);
}
