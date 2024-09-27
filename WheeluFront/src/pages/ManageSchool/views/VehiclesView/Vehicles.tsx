import { Button, Typography } from "@mui/material";
import ViewWrapper from "../Wrapper";
import VehicleTable from "./components/VehicleTable";
import { Add } from "@mui/icons-material";
import classes from "../common.module.css";
import { useParams } from "react-router-dom";
import React, { useCallback, useContext, useMemo } from "react";
import { AppContext } from "../../../../App";
import { useQueryClient } from "@tanstack/react-query";
import { SchoolPageContext } from "../../ManageSchoolPage";
import { OutsideContextNotifier } from "../../../../modules/utils";
import VehicleModal from "../../../../modals/VehicleModal/VehicleModal";
import { useSnackbar } from "notistack";

interface IContext {
	queryKey: (string | number)[];
	invalidateQuery: () => void;
}

export const VehicleContext = React.createContext<IContext>({
	invalidateQuery: OutsideContextNotifier,
	queryKey: [],
});

export default function VehiclesSchoolView() {
	const params = useParams();
	const { setModalContent, snackBarProps } = useContext(AppContext);
	const { access } = useContext(SchoolPageContext);
	const qClient = useQueryClient();
	const snack = useSnackbar();

	const queryKey = useMemo(
		() => ["Schools", "#", parseInt(params["id"] ?? ""), "Vehicles"],
		[params]
	);
	const invalidateQuery = useCallback(() => {
		qClient.invalidateQueries({
			queryKey: queryKey,
		});
	}, [queryKey]);

	const addVehicleCallback = useCallback(() => {
		setModalContent(
			<VehicleModal
				mode="create"
				onSuccess={() => {
					invalidateQuery();
					snack.enqueueSnackbar({
						...snackBarProps,
						message: "Pomyślnie dodano pojazd",
						variant: "success",
					});
				}}
				baseQuery={queryKey}
				schoolID={parseInt(params["id"] ?? "")}
				allowEdit={true}
			/>
		);
	}, []);

	return (
		<ViewWrapper headline="Pojazdy">
			<VehicleContext.Provider
				value={{ invalidateQuery, queryKey: queryKey }}
			>
				<div className={classes.SectionHeader}>
					<Typography variant="overline"></Typography>
					{access == "owner" && (
						<Button
							startIcon={<Add />}
							variant="contained"
							size="small"
							onClick={addVehicleCallback}
						>
							Dodaj
						</Button>
					)}
				</div>

				<VehicleTable
					schoolID={parseInt(params["id"] ?? "")}
					limitActions={access != "owner"}
				/>
			</VehicleContext.Provider>
		</ViewWrapper>
	);
}
