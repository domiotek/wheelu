import {
	Alert,
	Button,
	Divider,
	LinearProgress,
	List,
	ListItem,
	ListItemText,
	Rating,
	Typography,
} from "@mui/material";
import classes from "./SchoolPage.module.css";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { API } from "../../types/api";
import {
	c,
	callAPI,
	formatAddress,
	OutsideContextNotifier,
} from "../../modules/utils";
import EntityNotFound from "../AdminPanel/components/EntityNotFound/EntityNotFound";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";
import { createContext, useContext, useEffect, useState } from "react";
import { AppContext } from "../../App";
import { AccessLevel } from "../../modules/enums";
import { App } from "../../types/app";

interface IProps {
	viewPoint: "admin" | "owner";
	setCoverPhotoPreview: (preview: any) => void;
	schoolData: App.Models.ISchool | null;
}

export const SchoolPageContext = createContext<IProps>({
	viewPoint: null as any,
	setCoverPhotoPreview: OutsideContextNotifier,
	schoolData: null,
});

export default function SchoolPage({ viewPoint }: IProps) {
	const [coverPhotoPreview, setCoverPhotoPreview] = useState(null);

	const params = useParams();
	const navigate = useNavigate();

	const { accessLevel, userDetails } = useContext(AppContext);

	const {
		data: schoolData,
		error,
		isFetching,
		isPending,
	} = useQuery<API.School.Get.IResponse, API.School.Get.IEndpoint["error"]>({
		queryKey: ["Schools", "#", params["id"]],
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

	useEffect(() => {
		if (!schoolData) return;

		if (viewPoint == "admin" && accessLevel != AccessLevel.Administrator) {
			navigate("/");
		}

		if (
			viewPoint == "owner" &&
			schoolData.owner.id != userDetails?.userId
		) {
			navigate(`/schools/${params["id"]}`);
		}
	}, [schoolData]);

	if (isPending) return <LoadingScreen />;
	if (error?.status == 404) return <EntityNotFound />;

	return (
		<div className={classes.Wrapper}>
			<div
				className={c([
					classes.RefetchingLoader,
					[classes.Visible, isFetching],
				])}
			>
				<LinearProgress variant="indeterminate" />
			</div>
			{schoolData?.blocked && (
				<Alert severity="error">
					Profil {viewPoint == "admin" ? "tej" : "Twojej"} szkoły jest
					zablokowany.{" "}
					{viewPoint == "owner" &&
						"W razie wątpliwośći Skontaktuj się z administratorem."}
				</Alert>
			)}
			{schoolData?.hidden && !schoolData.blocked && (
				<Alert severity="warning">
					Profil {viewPoint == "admin" ? "tej" : "Twojej"} szkoły jest
					ukryty, co oznacza, że nie będzie pojawiać się ona w
					wynikach wyszukiwania.
				</Alert>
			)}
			<div className={classes.Header}>
				<List>
					<ListItem>
						<ListItemText
							primary="Nazwa"
							secondary={`${schoolData?.name}`}
						/>
					</ListItem>
					<Divider />
					<ListItem className={classes.OwnerListItem}>
						<ListItemText
							primary="Właściciel"
							secondary={`${schoolData?.owner.name} ${schoolData?.owner.surname}`}
						/>
						{viewPoint == "admin" && (
							<Button variant="outlined" color="secondary">
								Wyślij wiadomość
							</Button>
						)}
					</ListItem>
					<Divider />
					<ListItem>
						<ListItemText
							primary="Adres"
							secondary={formatAddress(
								schoolData?.address ?? ({} as any)
							)}
						/>
					</ListItem>
					<Divider />
					<ListItem className={classes.RatingListItem}>
						<Rating defaultValue={2.5} precision={0.5} readOnly />
						<Typography variant="body2">4.0 (12 ocen)</Typography>
					</ListItem>
				</List>
				<img
					className={classes.Image}
					src={coverPhotoPreview ?? schoolData?.coverImage.url}
					alt="School cover image"
				/>
			</div>
			<SchoolPageContext.Provider
				value={{
					viewPoint,
					setCoverPhotoPreview,
					schoolData: schoolData ?? null,
				}}
			>
				<Outlet />
			</SchoolPageContext.Provider>
		</div>
	);
}
