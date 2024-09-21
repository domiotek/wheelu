import VehiclePartGauge from "../../../components/VehiclePartGauge/VehiclePartGauge";
import CategoriesWidget from "../../../components/CategoriesWidget/CategoriesWidget";
import { Button, List, ListItem, ListItemText } from "@mui/material";
import classes from "../VehicleModal.module.css";
import { DateTime } from "luxon";
import { App } from "../../../types/app";
import { useMemo } from "react";
import VehicleService from "../../../services/Vehicle";

interface IProps {
	data: App.Models.IVehicle;
	parts: App.UI.IVehiclePartDef;
	onClose: () => void;
}

export default function PresentationView({ data, parts, onClose }: IProps) {
	const partComponets = useMemo(() => {
		const result = [];

		for (const partID in parts) {
			result.push(
				<VehiclePartGauge
					key={partID}
					name={parts[partID].name}
					editable={false}
					imageSrc={parts[partID].icon}
					className={classes.VehiclePart}
					replacedDate={parts[partID].lastCheckDate ?? undefined}
					lifeSpan={parts[partID].lifespan ?? undefined}
				/>
			);
		}
		return result;
	}, []);

	const engineText = useMemo(() => {
		return VehicleService.getEngineText({
			displacement: data.displacement,
			power: data.power,
			transmissionSpeedCount: data.transmissionSpeedCount,
			transmissionType: data.tranmissionType,
		});
	}, []);

	return (
		<>
			<div className={classes.Overview}>
				<img
					src={data.coverImage.url}
					alt="Vehicle image"
					className={classes.CoverImage}
				/>
				<div className={classes.VehicleParts}>
					{partComponets.map((comp) => comp)}
				</div>
			</div>
			<CategoriesWidget
				className={classes.CategoriesWidget}
				enabledList={new Set(data.allowedIn)}
			/>
			<div className={classes.PropsContainer}>
				<List>
					<ListItem divider>
						<ListItemText primary="Model" secondary={data.model} />
					</ListItem>
					<ListItem divider>
						<ListItemText
							primary="Rocznik"
							secondary={data.manufacturingYear}
						/>
					</ListItem>
				</List>
				<List>
					<ListItem divider>
						<ListItemText
							primary="Silnik i skrzynia biegów"
							secondary={
								engineText.trim().length > 0
									? engineText
									: "Nie podano"
							}
						/>
					</ListItem>
					<ListItem divider>
						<ListItemText
							primary="Przebieg"
							secondary={
								data.mileage
									? `${data.mileage}KM (${DateTime.fromISO(
											data.mileageUpdateDate ?? ""
									  ).toFormat("dd/LL/yyyy")})`
									: "Nie podano"
							}
						/>
					</ListItem>
				</List>
				<List>
					<ListItem divider>
						<ListItemText
							primary="Numer rejestracyjny"
							secondary={data.plate}
						/>
					</ListItem>
					<ListItem divider>
						<ListItemText
							primary="Ostatni przegląd"
							secondary={
								data.mileage
									? `${DateTime.fromISO(
											data.lastInspection ?? ""
									  ).toFormat("dd/LL/yyyy")})`
									: "Nie podano"
							}
						/>
					</ListItem>
				</List>
			</div>
			<div className={classes.ButtonsBar}>
				<Button variant="contained" onClick={() => onClose()}>
					Ok
				</Button>
			</div>
		</>
	);
}