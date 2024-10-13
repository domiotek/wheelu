import {
	Alert,
	AlertTitle,
	Button,
	IconButton,
	List,
	ListItem,
	ListItemText,
	Tab,
	Tabs,
	Typography,
} from "@mui/material";
import classes from "./CoursePage.module.css";
import { Message } from "@mui/icons-material";
import { CoursePageTab } from "../../modules/enums";
import {
	Suspense,
	useCallback,
	useLayoutEffect,
	useMemo,
	useState,
} from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";
import ProgressRingWithText from "../../components/ProgressRingWithText/ProgressRingWithText";
import { useQuery } from "@tanstack/react-query";
import { API } from "../../types/api";
import { callAPI } from "../../modules/utils";
import { CourseCategoriesMapping } from "../../modules/constants";
import AuthService from "../../services/Auth";
import { App } from "../../types/app";
export default function CoursePage() {
	const [activeTab, setActiveTab] = useState<CoursePageTab>(
		CoursePageTab.Rides
	);

	const navigate = useNavigate();
	const params = useParams();

	const courseID = useMemo(() => parseInt(params["courseID"]!), []);

	const { data, error, isPending } = useQuery<
		API.Courses.Get.IResponse,
		API.Courses.Get.IEndpoint["error"]
	>({
		queryKey: ["Courses", "#", courseID],
		queryFn: () =>
			callAPI<API.Courses.Get.IEndpoint>(
				"GET",
				"/api/v1/courses/:courseID",
				null,
				{ courseID }
			),
		retry: false,
		staleTime: 60000,
	});

	const changeTab = useCallback((tabID: CoursePageTab) => {
		switch (tabID) {
			default:
			case CoursePageTab.Rides:
				navigate("rides");
				break;
			case CoursePageTab.Exams:
				navigate("exams");
				break;
			case CoursePageTab.Manage:
				navigate("manage");
		}

		setActiveTab(tabID);
	}, []);

	useLayoutEffect(() => {
		if (error?.code == "EntityNotFound") navigate("/courses");
	}, [error]);

	const categoryName = useMemo(() => {
		return CourseCategoriesMapping.find((x) => x.id == data?.category)
			?.name;
	}, [data?.category]);

	if (isPending) return <LoadingScreen />;

	return (
		<div className={classes.Wrapper}>
			<Typography variant="h4">Kurs kategorii {categoryName}</Typography>

			<section className={classes.HeaderSection}>
				<ProgressRingWithText
					className={classes.HoursIndicator}
					value={(0 / (data?.hoursCount ?? 1)) * 100}
					caption={`0/${data?.hoursCount} godzin`}
					color="secondary"
				/>
				<List className={classes.PropList}>
					<ListItem divider>
						<ListItemText
							primary="Szkoła"
							secondary={data?.school.name}
						/>
					</ListItem>
					<ListItem divider>
						<ListItemText
							primary="Instruktor"
							secondary={AuthService.getUserFullName(
								data?.instructor as App.Models.IShortUser
							)}
						/>
						<IconButton color="secondary">
							<Message />
						</IconButton>
					</ListItem>
					<ListItem className={classes.ProgressListItem} divider>
						<ListItemText
							primary="Postęp w kursie"
							secondary="Jak dobrze radzisz sobie z poszczególnymi aspektami jazdy"
						/>
						<div className={classes.BreakContainer}>
							<ProgressRingWithText value={100} caption="100%" />
							<Button variant="outlined" color="secondary">
								Zobacz
							</Button>
						</div>
					</ListItem>
				</List>
			</section>
			<Alert
				className={classes.Alert}
				variant="outlined"
				action={
					<Button color="inherit" variant="outlined">
						Zobacz jazdę
					</Button>
				}
			>
				<AlertTitle>Twoja następna jazda</AlertTitle>
				Masz zaplanowaną jazdę w Piątek 12 o 15.
			</Alert>
			<Tabs
				className={classes.Tabs}
				orientation="horizontal"
				variant="scrollable"
				allowScrollButtonsMobile
				value={activeTab}
				onChange={(_val, id) => changeTab(id)}
				textColor="secondary"
				indicatorColor="secondary"
			>
				<Tab label="Jazdy" />
				<Tab label="Egzaminy" />
				<Tab label="Zarządzaj" />
			</Tabs>

			<Suspense fallback={<LoadingScreen />}>
				<Outlet />
			</Suspense>
		</div>
	);
}
