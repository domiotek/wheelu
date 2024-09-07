import ViewWrapper from "../Wrapper";
import { API } from "../../../../types/api";
import { callAPI } from "../../../../modules/utils";
import classes from "./Manage.module.css";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import LoadingScreen from "../../../../components/LoadingScreen/LoadingScreen";
import DataSection from "./components/DataSection";
import { SchoolPageContext } from "../../ManageSchoolPage";
import { useContext, useState } from "react";
import {
	Button,
	Divider,
	FormControlLabel,
	Switch,
	Typography,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import { AppContext } from "../../../../App";
import SchoolService from "../../../../services/School";

export default function ManageSchoolView() {
	const [savingDataChanges, setSavingDataChanges] = useState(false);

	const { snackBarProps } = useContext(AppContext);
	const { viewPoint, schoolData } = useContext(SchoolPageContext);
	const params = useParams();
	const qClient = useQueryClient();
	const snack = useSnackbar();

	const { data: cities, isFetching: fetchingCities } = useQuery<
		API.City.GetAll.IResponse,
		API.City.GetAll.IEndpoint["error"]
	>({
		queryKey: ["Cities"],
		queryFn: () =>
			callAPI<API.City.GetAll.IEndpoint>("GET", "/api/v1/cities"),
		retry: true,
		staleTime: 60000,
	});

	const { data: states, isFetching: fetchingStates } = useQuery<
		API.State.GetAll.IResponse,
		API.State.GetAll.IEndpoint["error"]
	>({
		queryKey: ["States"],
		queryFn: () =>
			callAPI<API.State.GetAll.IEndpoint>("GET", "/api/v1/states"),
		retry: true,
		staleTime: Infinity,
	});

	const toggleVisibility = useMutation<
		null,
		API.School.SetVisibility.IEndpoint["error"],
		API.School.SetVisibility.IRequestData
	>({
		mutationFn: (data) =>
			callAPI<API.School.SetVisibility.IEndpoint>(
				"PUT",
				"/api/v1/schools/:id/visibility",
				data,
				{ id: params["id"] ?? "" }
			),
		onSuccess: async () => {
			qClient.invalidateQueries({
				queryKey: ["Schools", "#", params["id"]],
			});
			snack.enqueueSnackbar({
				...snackBarProps,
				message: "Pomyślnie zmieniono widoczność.",
				variant: "success",
			});
		},
		onError: (err) => {
			snack.enqueueSnackbar({
				...snackBarProps,
				message: `Wystąpił problem podczas zmiany widoczności. ${SchoolService.translateSchoolUpdateErrorCode(
					err.code
				)}`,
				variant: "error",
			});
		},
	});

	const toggleBlockade = useMutation<
		null,
		API.School.SetBlockade.IEndpoint["error"],
		API.School.SetBlockade.IRequestData
	>({
		mutationFn: (data) =>
			callAPI<API.School.SetBlockade.IEndpoint>(
				"PUT",
				"/api/v1/schools/:id/blockade",
				data,
				{ id: params["id"] ?? "" }
			),
		onSuccess: async () => {
			qClient.invalidateQueries({
				queryKey: ["Schools", "#", params["id"]],
			});
			snack.enqueueSnackbar({
				...snackBarProps,
				message: "Pomyślnie zmieniono stan blokady.",
				variant: "success",
			});
		},
		onError: (err) => {
			snack.enqueueSnackbar({
				...snackBarProps,
				message: `Wystąpił problem podczas zmiany stanu blokady. ${SchoolService.translateSchoolUpdateErrorCode(
					err.code
				)}`,
				variant: "error",
			});
		},
	});

	if (fetchingCities || fetchingStates)
		return (
			<ViewWrapper headline="Zarządzaj profilem">
				<LoadingScreen />
			</ViewWrapper>
		);

	return (
		<ViewWrapper headline="Zarządzaj profilem">
			<div className={classes.PageWrapper}>
				<DataSection
					cities={cities!}
					states={states!}
					isAdmin={viewPoint == "admin"}
					disabled={
						toggleBlockade.isPending ||
						toggleVisibility.isPending ||
						schoolData?.blocked
					}
					onSavingChanges={setSavingDataChanges}
				/>
				<div className={classes.Section}>
					<Typography variant="h6">Widoczność profilu</Typography>
					<Divider />
					<Typography variant="body2">
						Ukrycie profilu szkoły sprawi, iż nie pojawi się on w
						wynikach wyszukiwania. Może okazać się to przydatne,
						jeśli chcesz wprowadzić zmiany w ofercie lub profilu.
					</Typography>
					<FormControlLabel
						control={
							<Switch
								checked={!schoolData?.hidden}
								color="secondary"
								disabled={
									toggleVisibility.isPending ||
									schoolData?.blocked ||
									toggleBlockade.isPending ||
									savingDataChanges
								}
								onChange={(ev) =>
									toggleVisibility.mutate({
										state: ev.target.checked,
									})
								}
							/>
						}
						label={
							toggleVisibility.isPending
								? "Trwa zmiana widoczności..."
								: `Profil ${
										schoolData?.hidden
											? "ukryty"
											: "widoczny"
								  }`
						}
					/>
				</div>
				{viewPoint == "admin" && (
					<>
						<div className={classes.Section}>
							<Typography variant="h6">
								Blokada profilu
							</Typography>
							<Divider />
							<Typography variant="body2">
								Ukrywa szkołę jazdy oraz blokuje możliwość
								zakupu nowych kursów. Obecni kursanci będą mogli
								dokończyć swoje kursy bez zakłóceń oraz
								niedogodności.
							</Typography>
							<Button
								variant="contained"
								color="error"
								onClick={() =>
									toggleBlockade.mutate({
										state: !schoolData?.blocked,
									})
								}
								disabled={
									toggleBlockade.isPending ||
									toggleVisibility.isPending ||
									savingDataChanges
								}
							>
								{schoolData?.blocked ? "Odblokuj" : "Zablokuj"}
							</Button>
						</div>
					</>
				)}
			</div>
		</ViewWrapper>
	);
}
