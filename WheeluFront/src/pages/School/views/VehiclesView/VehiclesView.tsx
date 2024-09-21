import {
	Button,
	Divider,
	List,
	ListItem,
	ListItemText,
	Paper,
	Typography,
} from "@mui/material";
import classes from "./VehiclesView.module.css";
import commonClasses from "../Common.module.css";
import { useQuery } from "@tanstack/react-query";
import { API } from "../../../../types/api";
import { callAPI } from "../../../../modules/utils";
import { useCallback, useContext, useMemo } from "react";
import { PublicSchooPageContext } from "../../SchoolPage";
import LoadingScreen from "../../../../components/LoadingScreen/LoadingScreen";
import InlineDot from "../../../../components/InlineDot/InlineDot";
import MessagePanel from "../../../../components/MessagePanel/MessagePanel";
import VehicleService from "../../../../services/Vehicle";
import { AppContext } from "../../../../App";
import VehicleModal from "../../../../modals/VehicleModal/VehicleModal";
import { renderCategoryChips } from "../../../../modules/features";

export default function VehiclesView() {
	const { schoolID } = useContext(PublicSchooPageContext);
	const { setModalContent } = useContext(AppContext);

	const queryKey = useMemo(() => {
		return ["Schools", "#", schoolID, "Vehicles"];
	}, [schoolID]);

	const { data, isFetching } = useQuery<
		API.Vehicles.GetAllOfSchool.IResponse,
		API.Vehicles.GetAllOfSchool.IEndpoint["error"]
	>({
		queryKey: ["Schools", "#", schoolID, "Vehicles"],
		queryFn: () =>
			callAPI<API.Vehicles.GetAllOfSchool.IEndpoint>(
				"GET",
				"/api/v1/schools/:schoolID/vehicles",
				null,
				{ schoolID }
			),
		retry: true,
		staleTime: 60000,
		enabled: schoolID != null,
	});

	const showVehicleModalCallback = useCallback(
		(id: number) => {
			setModalContent(
				<VehicleModal
					mode="update"
					baseQuery={queryKey}
					schoolID={schoolID}
					vehicleID={id}
					allowEdit={false}
					hideNote={true}
				/>
			);
		},
		[data]
	);

	return (
		<div className={commonClasses.ViewContainer}>
			<Typography variant="h5" gutterBottom>
				Pojazdy
			</Typography>
			<Divider />

			{isFetching && <LoadingScreen />}

			{data?.length == 0 && !isFetching ? (
				<MessagePanel image="/no-results.svg" caption="Brak pojazdów" />
			) : (
				<List>
					{data?.map((vehicle) => (
						<Paper
							key={vehicle.id}
							className={classes.VehiclePanel}
							component={ListItem}
						>
							<div className={classes.Content}>
								<ListItemText
									className={classes.Text}
									primary={
										<>
											{vehicle.model}
											<br />
											{renderCategoryChips(
												vehicle.allowedIn
											)}
										</>
									}
									secondary={
										<>
											{vehicle.manufacturingYear}
											{vehicle.displacement && (
												<>
													<InlineDot color="secondary" />
													{vehicle.displacement}L
												</>
											)}

											{vehicle.power && (
												<>
													<InlineDot color="secondary" />
													{vehicle.power}KM
												</>
											)}

											{(vehicle.tranmissionType ||
												vehicle.transmissionSpeedCount) && (
												<>
													<InlineDot color="secondary" />
													{vehicle.transmissionSpeedCount &&
														`${vehicle.transmissionSpeedCount}-biegowa`}
													{vehicle.tranmissionType &&
														`${
															VehicleService.getTransmissionTypes()[
																vehicle
																	.tranmissionType
															].label
														}`}
													skrzynia
												</>
											)}
										</>
									}
								/>
							</div>
							<Button
								variant="outlined"
								color="secondary"
								onClick={() =>
									showVehicleModalCallback(vehicle.id)
								}
							>
								Szczegóły
							</Button>
						</Paper>
					))}
				</List>
			)}
		</div>
	);
}
