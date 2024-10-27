import {
	Button,
	ButtonBase,
	List,
	ListItem,
	ListItemText,
	Paper,
} from "@mui/material";
import ButtonsBar from "../../../../components/ButtonsBar/ButtonsBar";
import InlineDot from "../../../../components/InlineDot/InlineDot";
import classes from "./RidesView.module.css";
import { useQuery } from "@tanstack/react-query";
import { API } from "../../../../types/api";
import { callAPI } from "../../../../modules/utils";
import { useCallback, useContext } from "react";
import { CoursePageContext } from "../../CoursePage";
import { ScheduleService } from "../../../../services/Schedule";
import LoadingScreen from "../../../../components/LoadingScreen/LoadingScreen";
import MessagePanel from "../../../../components/MessagePanel/MessagePanel";
import { AppContext } from "../../../../App";
import ScheduleRideModal from "../../../../modals/ScheduleRideModal/ScheduleRideModal";
import { DateTimeFormatter } from "../../../../modules/formatters";
import RideDetailsModal from "../../../../modals/RideDetailsModal/RideDetailsModal";

export default function RidesView() {
	const { setModalContent } = useContext(AppContext);
	const { course, baseQuery, canEdit, role, ranOutOfHours } =
		useContext(CoursePageContext);

	const { data, isPending } = useQuery<
		API.Courses.GetCourseRides.IResponse,
		API.Courses.GetCourseRides.IEndpoint["error"]
	>({
		queryKey: baseQuery.concat(["Rides"]),
		queryFn: () =>
			callAPI<API.Courses.GetCourseRides.IEndpoint>(
				"GET",
				"/api/v1/courses/:courseID/rides",
				null,
				{ courseID: course!.id }
			),
		retry: false,
		staleTime: 60000,
		enabled: course != null,
	});

	const getRideStartTimeLabel = useCallback(
		(ride: App.Models.IRide) =>
			DateTimeFormatter.formatAdaptiveFriendly(
				ride.startTime ?? ride.slot!.startTime
			),
		[]
	);

	const openSchedulerModal = useCallback(() => {
		if (!course) return;
		setModalContent(<ScheduleRideModal course={course} type="ride" />);
	}, [course]);

	const openRideModal = useCallback(
		(ride: App.Models.IRide) => {
			setModalContent(
				<RideDetailsModal
					ride={ride}
					rideID={ride.id}
					courseID={course!.id}
					canAlterState={canEdit}
					canChangeVehicle={canEdit && role == "instructor"}
				/>
			);
		},
		[course, canEdit, role]
	);

	return (
		<div className={classes.Wrapper}>
			{canEdit && !ranOutOfHours && (
				<ButtonsBar>
					<Button
						color="secondary"
						variant="contained"
						onClick={openSchedulerModal}
					>
						Zaplanuj jazdę
					</Button>
				</ButtonsBar>
			)}

			{isPending && <LoadingScreen />}

			{data?.length == 0 && !isPending ? (
				<MessagePanel
					image="/driver.svg"
					caption="Brak jazd, póki co :)"
				/>
			) : (
				<List className={classes.RideList}>
					{data?.map((ride) => (
						<ButtonBase
							key={ride.id}
							component={ListItem}
							onClick={() => openRideModal(ride)}
						>
							<Paper>
								<ListItemText
									primary={getRideStartTimeLabel(ride)}
									secondary={
										<>
											{ScheduleService.translateRideStatus(
												ride.status
											)}
											<InlineDot color="secondary" />
											{ride.vehicle.model}
											<InlineDot color="secondary" />#
											{ride.vehicle.plate}
										</>
									}
								/>
							</Paper>
						</ButtonBase>
					))}
				</List>
			)}
		</div>
	);
}
