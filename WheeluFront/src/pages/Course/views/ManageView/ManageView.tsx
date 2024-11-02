import {
	Alert,
	AlertTitle,
	Button,
	Card,
	CardContent,
	List,
	ListItem,
	ListItemText,
	Tooltip,
	Typography,
} from "@mui/material";
import classes from "./ManageView.module.css";
import { useCallback, useContext, useMemo } from "react";
import { CoursePageContext } from "../../CoursePage";
import {
	CurrencyFormatter,
	DateTimeFormatter,
} from "../../../../modules/formatters";
import { AppContext } from "../../../../App";
import NewInstructorChangeRequestModal from "../../../../modals/NewInstructorChangeRequestModal/NewInstructorChangeRequestModal";
import { RequestStatus, RideStatus } from "../../../../modules/enums";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API } from "../../../../types/api";
import { callAPI, formatPolishWordSuffix } from "../../../../modules/utils";
import LoadingScreen from "../../../../components/LoadingScreen/LoadingScreen";
import InlineDot from "../../../../components/InlineDot/InlineDot";
import ButtonsBar from "../../../../components/ButtonsBar/ButtonsBar";
import CourseService from "../../../../services/Course";
import AuthService from "../../../../services/Auth";
import { GetUserConfirmation } from "../../../../modules/features";
import { toast } from "react-toastify";
import ChangeCourseInstructorModal from "../../../../modals/ChangeCourseInstructorModal/ChangeCourseInstructorModal";
import BuyHoursModal from "../../../../modals/BuyHoursModal/BuyHoursModal";
import TransactionService from "../../../../services/Transaction";
import MessagePanel from "../../../../components/MessagePanel/MessagePanel";

export default function ManageView() {
	const { setModalContent, userDetails } = useContext(AppContext);
	const { role, canEdit, course } = useContext(CoursePageContext);
	const qClient = useQueryClient();

	const baseQueryKey = useMemo(() => {
		return ["Schools", "#", course?.school.id];
	}, [course]);

	const { data: icRequest, isFetching } = useQuery<
		API.Courses.ChangeInstructorRequest.GetFromCourse.IResponse,
		API.Courses.ChangeInstructorRequest.GetFromCourse.IEndpoint["error"]
	>({
		queryKey: baseQueryKey.concat(["instructor-change-request"]),
		queryFn: () =>
			callAPI<API.Courses.ChangeInstructorRequest.GetFromCourse.IEndpoint>(
				"GET",
				"/api/v1/courses/:courseID/instructor-change-request",
				null,
				{ courseID: course!.id }
			),
		retry: true,
		staleTime: 60000,
		enabled: role != "other",
	});

	const { data: hourPackages } = useQuery<
		API.Courses.GetHoursPackages.IResponse,
		API.Courses.GetHoursPackages.IEndpoint["error"]
	>({
		queryKey: baseQueryKey.concat(["hours-packages"]),
		queryFn: () =>
			callAPI<API.Courses.GetHoursPackages.IEndpoint>(
				"GET",
				"/api/v1/courses/:courseID/hours-packages",
				null,
				{ courseID: course!.id }
			),
		retry: true,
		staleTime: 60000,
	});

	const cancelICRequest = useMutation<
		null,
		API.Courses.ChangeInstructorRequest.DeleteFromCourse.IEndpoint["error"]
	>({
		mutationFn: () => {
			return callAPI<API.Courses.ChangeInstructorRequest.DeleteFromCourse.IEndpoint>(
				"DELETE",
				"/api/v1/courses/:courseID/instructor-change-request",
				null,
				{ courseID: course!.id }
			);
		},
		onSuccess: () => {
			qClient.invalidateQueries({
				queryKey: baseQueryKey.concat(["instructor-change-request"]),
			});
			toast.success("Pomyślnie anulowano wniosek.");
		},
		onError: () => toast.error("Nie udało się anulować wniosku."),
	});

	const handleChangeInstructorModal = useCallback(() => {
		if (role != "other")
			setModalContent(
				<NewInstructorChangeRequestModal course={course!} />
			);
		else setModalContent(<ChangeCourseInstructorModal course={course!} />);
	}, [course, role]);

	const openHoursBuyingModal = useCallback(() => {
		setModalContent(<BuyHoursModal course={course!} />);
	}, [course]);

	const changeInstructorTexts = useMemo(() => {
		switch (role) {
			case "student":
				return {
					title: "Zmień instruktora",
					desc: "Poproś o zmianę instruktora. Twój wniosek zostanie rozpatrzony przez administratora szkoły jazdy.",
					action: "Złóż wniosek",
				};
			case "instructor":
				return {
					title: "Przenieś kursanta",
					desc: "Poproś o przeniesienie kursanta do innego instruktora. Twój wniosek zostanie rozpatrzony przez administratora szkoły jazdy.",
					action: "Złóż wniosek",
				};
			case "other":
				return {
					title: "Zmień instruktora",
					desc: "Zmień instruktora przypisanego do tego kursu.",
					action: "Zmień",
				};
		}
	}, []);

	const cancelChangeInstructorRequest = useCallback(async () => {
		const confirmed = await GetUserConfirmation(setModalContent, {
			header: "Czy na pewno chcesz anulować wniosek?",
			message:
				"Ta akcja jest nieodwracalna, lecz zawsze możesz złożyć nowy wniosek.",
		});

		if (confirmed) cancelICRequest.mutate();
	}, []);

	const showChangeInstructorAction = useMemo(() => {
		return (
			userDetails?.role != "Administrator" &&
			(role != "instructor" || canEdit)
		);
	}, []);

	const disableChangeInstructorAction = useMemo(() => {
		return (
			(course?.nextRide != undefined && role != "other") ||
			course?.nextRide?.status == RideStatus.Ongoing ||
			icRequest?.status == RequestStatus.Pending
		);
	}, [course, icRequest]);

	return (
		<div className={classes.Wrapper}>
			<section>
				<Typography variant="h6">Dokupione godziny</Typography>
				{role == "student" && (
					<ButtonsBar>
						<Typography>
							{CurrencyFormatter.format(course?.pricePerHour!)}
						</Typography>
						<Button
							variant="outlined"
							color="secondary"
							onClick={openHoursBuyingModal}
						>
							Dokup
						</Button>
					</ButtonsBar>
				)}

				<List className={classes.List}>
					{hourPackages?.map((hPackage) => (
						<ListItem key={hPackage.id} divider>
							<ListItemText
								primary={`Pakiet godzin (${
									hPackage.hoursCount
								} godzin${formatPolishWordSuffix(
									hPackage.hoursCount,
									["a", "y", ""]
								)})`}
								secondary={`Dodany ${DateTimeFormatter.format(
									hPackage.created
								)}`}
							/>
							<ListItemText
								className={classes.HoursPackageStatus}
								primary={CurrencyFormatter.format(
									hPackage.totalPaymentAmount
								)}
								secondary={
									hPackage.status
										? TransactionService.translateTransactionStatus(
												hPackage.status
										  )
										: "Podarowana"
								}
							/>
						</ListItem>
					))}
					{hourPackages?.length == 0 && (
						<MessagePanel
							className={classes.NoHoursPackagesMessage}
							image="/no-results.svg"
							caption="Brak zakupionych pakietów"
						/>
					)}
				</List>
			</section>

			{showChangeInstructorAction && (
				<section>
					<Typography variant="h6" gutterBottom>
						{changeInstructorTexts.title}
					</Typography>
					<Typography variant="body2">
						{changeInstructorTexts.desc}
					</Typography>
					{role != "other" && (
						<Alert className={classes.Alert} severity="warning">
							<AlertTitle>Uwaga</AlertTitle>
							Administrator może odrzucić Twój wniosek z powodów
							od niego niezależnych, jak na przykład brak
							dostępnych instruktorów.
						</Alert>
					)}

					{role == "other" && (
						<Alert className={classes.Alert} severity="info">
							<AlertTitle>Informacja</AlertTitle>Zmiana
							instruktora anuluje także wszystkie zaplanowane
							jazdy.
						</Alert>
					)}

					{isFetching ? (
						<LoadingScreen></LoadingScreen>
					) : (
						<>
							{icRequest && (
								<Card>
									<CardContent>
										<Typography variant="body1">
											Twój ostatni wniosek
										</Typography>
										<Typography
											variant="caption"
											gutterBottom
										>
											Złożony{" "}
											{DateTimeFormatter.format(
												icRequest.requestedAt
											)}
											<InlineDot color="secondary" />
											{CourseService.formatRequestStatus(
												icRequest.status
											)}
											<InlineDot color="secondary" />
											{icRequest.requestedInstructor
												?.instructor.user
												? AuthService.getUserFullName(
														icRequest
															.requestedInstructor
															?.instructor.user
												  )
												: "Dowolny"}
										</Typography>
										<Typography
											className={classes.RequestNote}
											variant="body2"
										>
											{icRequest.note}
										</Typography>
										<ButtonsBar>
											{icRequest.status ==
												RequestStatus.Pending && (
												<Button
													onClick={
														cancelChangeInstructorRequest
													}
												>
													Anuluj
												</Button>
											)}
										</ButtonsBar>
									</CardContent>
								</Card>
							)}

							<Tooltip
								title="Nie można zażądać zmiany, gdyż jest zaplanowana jazda."
								disableHoverListener={
									course?.nextRide == undefined ||
									role == "other"
								}
								disableFocusListener={
									course?.nextRide == undefined ||
									role == "other"
								}
							>
								<span className={classes.SectionButtonWrapper}>
									<Button
										className={classes.SectionButton}
										variant="contained"
										color="secondary"
										onClick={handleChangeInstructorModal}
										disabled={disableChangeInstructorAction}
									>
										{changeInstructorTexts.action}
									</Button>
								</span>
							</Tooltip>
						</>
					)}
				</section>
			)}
		</div>
	);
}
