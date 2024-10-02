import {
	Alert,
	Avatar,
	Button,
	Divider,
	Link,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	Tooltip,
	Typography,
} from "@mui/material";
import commonClasses from "../Common.module.css";
import classes from "./CourseView.module.css";
import { Link as RouterLink, useLocation, useParams } from "react-router-dom";
import {
	c,
	callAPI,
	formatPolishWordSuffix,
	popUrlSegment,
} from "../../../../modules/utils";
import { Fragment, useCallback, useContext, useMemo } from "react";
import { AppContext } from "../../../../App";
import { PublicSchooPageContext } from "../../SchoolPage";
import { useQuery } from "@tanstack/react-query";
import { API } from "../../../../types/api";
import { App } from "../../../../types/app";
import { CurrencyFormatter } from "../../../../modules/formatters";
import LoadingScreen from "../../../../components/LoadingScreen/LoadingScreen";
import { initialsAvatarProps } from "../../../../modules/features";
import InlineDot from "../../../../components/InlineDot/InlineDot";
import MessagePanel from "../../../../components/MessagePanel/MessagePanel";
import VehicleService from "../../../../services/Vehicle.tsx";
import BuyCourseModal from "../../../../modals/BuyCourseModal/BuyCourseModal.tsx";

export default function CourseView() {
	const location = useLocation();
	const params = useParams();
	const { activeTheme, userDetails, setModalContent } =
		useContext(AppContext);
	const { schoolID } = useContext(PublicSchooPageContext);

	const { data, isFetching, error } = useQuery<
		API.Offers.Courses.GetAllOfSchool.IResponse,
		API.Offers.Courses.GetAllOfSchool.IEndpoint["error"],
		App.Models.ICourseOffer | null
	>({
		queryKey: ["Schools", "#", parseInt("3"), "Offers"],
		queryFn: () =>
			callAPI<API.Offers.Courses.GetAllOfSchool.IEndpoint>(
				"GET",
				"/api/v1/offers",
				{ schoolID }
			),
		select: (data) =>
			data.entries.find(
				(val) =>
					val.id == parseInt(params["courseId"] ?? "") && val.enabled
			) ?? null,
		retry: true,
		staleTime: 60000,
		enabled: schoolID != null,
	});

	const buyCourseModal = useCallback(() => {
		if (data) setModalContent(<BuyCourseModal offer={data} />);
	}, [data]);

	const canBuy = useMemo(() => {
		return userDetails?.role == "Student";
	}, [userDetails]);

	if (isFetching) return <LoadingScreen />;

	if (error || !data)
		return (
			<MessagePanel image="/tangled.svg" caption="Coś poszło nie tak" />
		);

	return (
		<div className={c([commonClasses.ViewContainer, classes.Container])}>
			<div className={commonClasses.Breadcrumbs}>
				<Link
					variant="h5"
					component={RouterLink}
					to={popUrlSegment(location.pathname)}
					color={activeTheme.palette.text.disabled}
				>
					Kursy
				</Link>
				/
				<Typography variant="h5">
					Kategoria {data?.category.name}
				</Typography>
			</div>
			<Divider />

			<section className={classes.BuySection}>
				<Typography variant="h4">
					{CurrencyFormatter.format(data.price)}
				</Typography>

				<Tooltip
					title="Twoje konto musi być typu 'Kursant'."
					disableHoverListener={canBuy}
					disableFocusListener={canBuy}
				>
					<span>
						<Button
							variant="contained"
							size="large"
							disabled={!canBuy}
							onClick={buyCourseModal}
						>
							Kup kurs
						</Button>
					</span>
				</Tooltip>
			</section>
			<section className={classes.DetailsSection}>
				<Typography variant="h6">Szczegóły</Typography>
				<List sx={{ flexDirection: "row", display: "flex" }}>
					<ListItem>
						<ListItemText
							primary="Wymagany wiek"
							secondary={
								data.category.requiredAge ?? "nie określono"
							}
						/>
					</ListItem>
					<ListItem>
						<ListItemText
							primary="Wliczone godziny"
							secondary={data.hoursCount}
						/>
					</ListItem>
					<ListItem>
						<ListItemText
							primary="Dodatkowe godziny"
							secondary={
								<>
									{CurrencyFormatter.format(
										data.pricePerHour
									)}
									/godz
								</>
							}
						/>
					</ListItem>
				</List>
				<div className={classes.AlertWrapper}>
					<Alert severity="info" variant="outlined">
						Możesz rozpocząć kurs nawet, jeśli nie masz jeszcze
						wymaganego wieku, lecz nie wcześniej niż 3 miesiące
						przed jego ukończeniem.
					</Alert>
					{data?.category.specialRequirements && (
						<Alert
							severity="warning"
							variant="outlined"
							action={
								<Link
									href="https://www.gov.pl/web/gov/kategorie-prawa-jazdy"
									color={activeTheme.palette.secondary.light}
								>
									Zobacz Szczegóły
								</Link>
							}
						>
							Kurs tej kategorii ma niestandardowe wymagania.
							Przed kupnem, upewnij się, że spełniasz je
							wszystkie.
						</Alert>
					)}
				</div>
			</section>
			<section className={classes.InstructorSection}>
				<Typography variant="h6">Instruktorzy</Typography>
				<Divider />

				{data.instructors.length > 0 ? (
					<List>
						{data.instructors.map((instructor) => {
							const fullName = `${instructor.instructor.user.name} ${instructor.instructor.user.surname}`;

							return (
								<Fragment key={instructor.id}>
									<ListItem>
										<ListItemAvatar>
											<Avatar
												{...initialsAvatarProps(
													fullName
												)}
											/>
										</ListItemAvatar>
										<ListItemText
											primary={fullName}
											secondary={
												<>
													{
														instructor.assignedCoursesCount
													}{" "}
													kursów (
													{
														instructor.activeCoursesCount
													}{" "}
													aktywn
													{formatPolishWordSuffix(
														instructor.activeCoursesCount,
														["y", "e", "ych"]
													)}
													)
													<InlineDot color="secondary" />
													4.65
												</>
											}
										/>
										<Button
											variant="outlined"
											color="secondary"
											disableRipple
											size="small"
											disabled={
												instructor.activeCoursesCount >=
												instructor.maximumConcurrentStudents
											}
										>
											{instructor.activeCoursesCount}/
											{
												instructor.maximumConcurrentStudents
											}
											<br />
											{instructor.activeCoursesCount >=
											instructor.maximumConcurrentStudents
												? "Niedostępny"
												: "Dostępny"}
										</Button>
									</ListItem>
									<Divider variant="inset" component="li" />
								</Fragment>
							);
						})}
					</List>
				) : (
					<MessagePanel
						image="/no-results.svg"
						caption="Brak instruktorów"
					/>
				)}
			</section>
			<section className={classes.InstructorSection}>
				<Typography variant="h6">Pojazdy</Typography>
				<Divider />

				{data.vehicles.length > 0 ? (
					<List>
						{data.vehicles.map((vehicle) => (
							<Fragment key={vehicle.id}>
								<ListItem>
									<ListItemText
										primary={vehicle.model}
										secondary={VehicleService.getListSecondaryText(
											vehicle
										)}
									/>
								</ListItem>
								<Divider variant="inset" component="li" />
							</Fragment>
						))}
					</List>
				) : (
					<MessagePanel
						image="/no-results.svg"
						caption="Brak pojazdów"
					/>
				)}
			</section>
		</div>
	);
}
