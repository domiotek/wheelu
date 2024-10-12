import {
	Alert,
	AlertTitle,
	Button,
	Rating,
	Tab,
	Tabs,
	Typography,
	useMediaQuery,
} from "@mui/material";
import classes from "./SchoolPage.module.css";
import CategoriesWidget from "../../components/CategoriesWidget/CategoriesWidget";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import React, {
	Suspense,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { SchoolPageTab } from "../../modules/enums";
import { useQuery } from "@tanstack/react-query";
import { API } from "../../types/api";
import { callAPI, formatAddress } from "../../modules/utils";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";
import EntityNotFound from "../AdminPanel/components/EntityNotFound/EntityNotFound";
import { DateTime } from "luxon";
import { AppContext } from "../../App";
import LazyBackendImage from "../../components/LazyBackendImage/LazyBackendImage";

interface IContext {
	schoolID: number;
	schoolData: API.School.Get.IResponse | null;
}

export const PublicSchooPageContext = React.createContext<IContext>({
	schoolID: -1,
	schoolData: null,
});

export default function SchoolPage() {
	const [activeTab, setActiveTab] = useState<SchoolPageTab>(
		SchoolPageTab.Courses
	);

	const isDesktop = useMediaQuery("(min-width: 769px)");
	const navigate = useNavigate();
	const params = useParams();
	const { userDetails } = useContext(AppContext);
	const location = useLocation();

	const {
		data: schoolData,
		error,
		isPending,
	} = useQuery<API.School.Get.IResponse, API.School.Get.IEndpoint["error"]>({
		queryKey: ["Schools", "#", parseInt(params["id"] ?? "")],
		queryFn: () =>
			callAPI<API.School.Get.IEndpoint>(
				"GET",
				"/api/v1/schools/:id",
				null,
				{ id: params["id"] ?? "" }
			),
		retry: false,
		staleTime: 60000,
	});

	const changeTab = useCallback((tabID: SchoolPageTab) => {
		switch (tabID) {
			default:
			case SchoolPageTab.Courses:
				navigate("courses");
				tabID = SchoolPageTab.Courses;
				break;
			case SchoolPageTab.Services:
				navigate("services");
				break;
			case SchoolPageTab.Reviews:
				navigate("reviews");
				break;
			case SchoolPageTab.Instructors:
				navigate("instructors");
				break;
			case SchoolPageTab.Vehicles:
				navigate("vehicles");
				break;
			case SchoolPageTab.Contact:
				navigate("contact");
				break;
		}

		setActiveTab(tabID);
	}, []);

	useEffect(() => {
		const parts = location.pathname.split("/");
		const section = parts[parts.length - 1];

		let tab;

		switch (section) {
			case "instructors":
				tab = SchoolPageTab.Instructors;
				break;
			case "vehicles":
				tab = SchoolPageTab.Vehicles;
				break;
			case "contact":
				tab = SchoolPageTab.Contact;
				break;
			case "courses":
			default:
				tab = SchoolPageTab.Courses;
				break;
		}

		setActiveTab(tab);
	}, []);

	if (isPending) return <LoadingScreen />;
	if (error?.status == 404 || error?.status == 400) return <EntityNotFound />;

	return (
		<div>
			{schoolData?.blocked && (
				<Alert className={classes.BlockadeAlert} severity="error">
					<AlertTitle>Ta szkoła jest zablokowana</AlertTitle>
					Administrator zablokował tę szkołę ze względu na naruszenie
					polityki platformy. Zakup nowych kursów nie będzie możliwy.
				</Alert>
			)}
			<div className={classes.Header}>
				<div className={classes.TopSection}>
					<LazyBackendImage
						className={classes.Image}
						url={schoolData?.coverImage.url ?? ""}
						alt="Driving school picture"
					/>
					<div className={classes.DetailsSection}>
						<Typography variant="h3">
							{schoolData?.name}{" "}
							{userDetails?.ownedSchool?.id ===
								schoolData?.id && (
								<Button onClick={() => navigate("manage")}>
									Zarządzaj
								</Button>
							)}
						</Typography>
						<div className={classes.DetailsWrapper}>
							<div className={classes.DetailCell}>
								<Typography variant="h6">Adres</Typography>
								<Typography variant="body2">
									{schoolData?.address &&
										formatAddress(schoolData.address)}
								</Typography>
							</div>
							<div className={classes.DetailCell}>
								<Typography variant="h6">
									Kursanci (aktywni)
								</Typography>
								<Typography variant="body2">
									{schoolData?.coursesCount} (
									{schoolData?.activeCoursesCount})
								</Typography>
							</div>
							<div className={classes.DetailCell}>
								<Typography variant="h6">
									Wskaźnik zdawalności
								</Typography>
								<Typography variant="body2">67%</Typography>
							</div>
							<div className={classes.DetailCell}>
								<Typography variant="h6">Założona</Typography>
								<Typography variant="body2">
									{DateTime.fromISO(
										schoolData?.established ?? ""
									).toFormat("dd/LLL/yyyy")}
								</Typography>
							</div>
							<div className={classes.DetailCell}>
								<Typography variant="h6">Pojazdy</Typography>
								<Typography variant="body2">
									{schoolData?.vehicleCount ?? 0}
								</Typography>
							</div>
							<div className={classes.DetailCell}>
								<Typography variant="h6">
									Najstarszy pojazd
								</Typography>
								<Typography variant="body2">
									{schoolData?.oldestVehicleYear ??
										"Nie dotyczy"}
								</Typography>
							</div>
						</div>
						<div>
							<Rating />
							<Typography variant="body2">
								4.0 (14 ocen)
							</Typography>
						</div>
					</div>
				</div>
				<CategoriesWidget
					className={classes.CategoriesWidget}
					enabledList={new Set(schoolData?.courseOffers)}
				/>
			</div>
			<div className={classes.MainContentWrapper}>
				<div>
					<Tabs
						orientation={isDesktop ? "vertical" : "horizontal"}
						variant={isDesktop ? "standard" : "scrollable"}
						allowScrollButtonsMobile
						value={activeTab}
						onChange={(_val, id) => changeTab(id)}
						textColor="secondary"
						indicatorColor="secondary"
					>
						<Tab label="Kursy" />
						<Tab label="Usługi" />
						<Tab label="Opinie" />
						<Tab label="Instruktorzy" />
						<Tab label="Pojazdy" />
						<Tab label="Kontakt" />
					</Tabs>
				</div>
				<PublicSchooPageContext.Provider
					value={{
						schoolData: schoolData ?? null,
						schoolID: parseInt(params["id"] ?? ""),
					}}
				>
					<Suspense fallback={<LoadingScreen />}>
						<Outlet />
					</Suspense>
				</PublicSchooPageContext.Provider>
			</div>
		</div>
	);
}
