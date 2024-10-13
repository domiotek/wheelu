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
import classes from "./ManageSchoolPage.module.css";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { QueryKey, useQuery } from "@tanstack/react-query";
import { API } from "../../types/api";
import {
	c,
	callAPI,
	formatAddress,
	OutsideContextNotifier,
} from "../../modules/utils";
import EntityNotFound from "../AdminPanel/components/EntityNotFound/EntityNotFound";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";
import {
	createContext,
	Suspense,
	useContext,
	useLayoutEffect,
	useMemo,
	useState,
} from "react";
import { AppContext } from "../../App";
import { AccessLevel } from "../../modules/enums";
import { App } from "../../types/app";
import LazyBackendImage from "../../components/LazyBackendImage/LazyBackendImage";

interface IProps {
	viewPoint: "admin" | "others";
}

interface IManageSchoolPageContext {
	access: "admin" | "owner" | "instructor";
	accessorUserID: string;
	setCoverPhotoPreview: (preview: any) => void;
	schoolData: App.Models.ISchool | null;
	queryKey: QueryKey;
}

export const SchoolPageContext = createContext<IManageSchoolPageContext>({
	access: null as any,
	accessorUserID: null as any,
	setCoverPhotoPreview: OutsideContextNotifier,
	schoolData: null,
	queryKey: [],
});

export default function ManageSchoolPage({ viewPoint }: IProps) {
	const [coverPhotoPreview, setCoverPhotoPreview] = useState(null);
	const [access, setAccess] =
		useState<IManageSchoolPageContext["access"]>("instructor");

	const params = useParams();
	const navigate = useNavigate();

	const { accessLevel, userDetails } = useContext(AppContext);

	const queryKey = useMemo(
		() => ["Schools", "#", parseInt(params["id"] ?? "")],
		[params]
	);

	const {
		data: schoolData,
		error,
		isFetching,
		isPending,
	} = useQuery<API.School.Get.IResponse, API.School.Get.IEndpoint["error"]>({
		queryKey,
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

	useLayoutEffect(() => {
		if (!schoolData) return;

		switch (accessLevel) {
			case AccessLevel.Administrator:
				setAccess("admin");
				break;
			case AccessLevel.SchoolOwner:
				setAccess("owner");
				break;
			case AccessLevel.Instructor:
				setAccess("instructor");
				break;
		}

		if (
			(accessLevel == AccessLevel.SchoolOwner &&
				schoolData.owner.id == userDetails?.userId) ||
			(accessLevel == AccessLevel.Instructor &&
				schoolData.instructors.includes(
					userDetails?.instructorProfile?.id ?? -1
				)) ||
			accessLevel == AccessLevel.Administrator
		) {
			return;
		}

		navigate(`/schools/${params["id"]}`);
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
					{viewPoint == "others" &&
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
					<ListItem className={classes.CollapsableListItem}>
						<ListItemText
							primary="Nazwa"
							secondary={`${schoolData?.name}`}
						/>
						<Button
							variant="outlined"
							size="small"
							onClick={() =>
								navigate(`/schools/${schoolData?.id}`)
							}
						>
							Przejdź na profil publiczny
						</Button>
					</ListItem>
					<Divider />
					<ListItem className={classes.CollapsableListItem}>
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
				{coverPhotoPreview ? (
					<img
						className={classes.Image}
						src={coverPhotoPreview}
						alt="School cover image"
					/>
				) : (
					<LazyBackendImage
						className={classes.Image}
						url={schoolData?.coverImage.url ?? ""}
						alt="School cover image"
					/>
				)}
			</div>
			<SchoolPageContext.Provider
				value={{
					access,
					accessorUserID: userDetails?.userId!,
					setCoverPhotoPreview,
					schoolData: schoolData ?? null,
					queryKey,
				}}
			>
				<Suspense fallback={<LoadingScreen />}>
					<Outlet />
				</Suspense>
			</SchoolPageContext.Provider>
		</div>
	);
}
