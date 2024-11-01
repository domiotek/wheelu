import { useContext, useLayoutEffect, useMemo, useState } from "react";
import { ModalContext } from "../../components/ModalContainer/ModalContainer";
import classes from "./VehicleModal.module.css";
import { Button, Toolbar, Typography } from "@mui/material";
import { AppContext } from "../../App";
import ElevatedHeader from "../../components/ElevatedHeader/ElevatedHeader";
import PresentationView from "./components/PresentationView";
import EditView from "./components/EditView";
import { QueryKey, useQuery } from "@tanstack/react-query";
import { API } from "../../types/api";
import { callAPI } from "../../modules/utils";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";
import { VehiclePartType } from "../../modules/enums";
import { DateTime } from "luxon";
import VehicleService from "../../services/Vehicle.tsx";

interface ICommonProps {
	onSuccess?: () => void;
	schoolID: number;
	baseQuery: QueryKey;
	allowEdit: boolean;
	hideNote?: boolean;
}

interface ICreateProps {
	mode: "create";
	vehicleID?: undefined;
}

interface IUpdateProps {
	mode: "update";
	vehicleID?: number;
}

type IProps = ICommonProps & (ICreateProps | IUpdateProps);

export default function VehicleModal({
	mode,
	baseQuery,
	schoolID,
	vehicleID,
	allowEdit,
	hideNote,
	onSuccess,
}: IProps) {
	const [editMode, setEditMode] = useState(false);

	const { activeTheme } = useContext(AppContext);
	const { setHostClassName, hostRef, closeModal } = useContext(ModalContext);

	const { data, isFetching } = useQuery<
		API.Vehicles.GetOne.IResponse,
		API.Vehicles.GetOne.IEndpoint["error"]
	>({
		queryKey: baseQuery.concat([vehicleID]),
		queryFn: () =>
			callAPI<API.Vehicles.GetOne.IEndpoint>(
				"GET",
				"/api/v1/schools/:schoolID/vehicles/:vehicleID",
				null,
				{ schoolID, vehicleID: vehicleID! }
			),
		retry: true,
		staleTime: 60000,
		enabled: vehicleID != undefined,
	});

	const parts = useMemo(() => {
		const result: App.UI.IVehiclePartDef = {};

		for (const partID of Object.values(VehiclePartType)) {
			if (typeof partID == "string") continue;

			const part = data?.parts.find((value) => value.part.id === partID);
			const props = VehicleService.getPartProps(partID);
			result[partID] = {
				lastCheckDate: part?.lastCheckDate
					? DateTime.fromISO(part.lastCheckDate)
					: null,
				lifespan: part?.part.lifespanInDays ?? null,
				icon: "/icons/" + props.icon,
				name: props.name,
			};
		}

		return result;
	}, [data]);

	useLayoutEffect(() => {
		setHostClassName(classes.Modal);
	}, []);

	return (
		<div className={classes.ModalContent}>
			<ElevatedHeader
				sx={{ background: activeTheme.palette.background.default }}
				elevation={2}
				scrollerRef={
					hostRef?.querySelector(".simplebar-content-wrapper") ??
					undefined
				}
				className={classes.Header}
			>
				<Toolbar>
					<Typography
						variant="h6"
						sx={{
							background: activeTheme.palette.background.default,
						}}
					>
						{mode == "create"
							? "Dodaj pojazd"
							: "Szczegóły pojazdu"}
						{mode == "update" && !editMode && allowEdit && (
							<Button
								size="small"
								onClick={() => setEditMode(true)}
							>
								Edytuj
							</Button>
						)}
					</Typography>
				</Toolbar>
			</ElevatedHeader>
			{isFetching || (!data && mode != "create") ? (
				<LoadingScreen />
			) : editMode || mode == "create" ? (
				<EditView
					schoolID={schoolID}
					parts={parts}
					data={data}
					onBack={() =>
						mode == "update" ? setEditMode(false) : closeModal()
					}
					onSuccess={() => {
						closeModal();
						onSuccess && onSuccess();
					}}
					hideNote={hideNote}
				/>
			) : (
				<PresentationView
					data={data!}
					parts={parts}
					onClose={() => closeModal()}
					hideNote={hideNote}
				/>
			)}
		</div>
	);
}
