import {
	Autocomplete,
	Button,
	IconButton,
	MenuItem,
	TextField,
	Typography,
} from "@mui/material";
import classes from "./NearbyCitiesEditWidget.module.css";
import { Close } from "@mui/icons-material";
import { useCallback } from "react";
import { App } from "../../types/app";
import { c } from "../../modules/utils";

interface IProps {
	className?: string;
	cities: App.Models.ICity[];
	states: App.Models.IState[];
	nearbyCitiesList: Partial<App.Models.ICityMatching>[];
	setNearbyCitiesList: React.Dispatch<
		React.SetStateAction<Partial<App.Models.ICityMatching>[]>
	>;
	readonly?: boolean;
}

export default function NearbyCitiesEditWidget({
	className,
	cities,
	states,
	nearbyCitiesList,
	setNearbyCitiesList,
	readonly,
}: IProps) {
	const addNewCityCallback = useCallback(() => {
		if (
			nearbyCitiesList.find(
				(val) => Object.keys(val).length == 1 && val.cityName == ""
			)
		)
			return;

		const array = Array.from(nearbyCitiesList);
		array.push({ cityName: "" });

		setNearbyCitiesList(array);
	}, [nearbyCitiesList]);

	const modifyCityCallback = useCallback(
		(
			record: Partial<App.Models.ICityMatching>,
			type: "city" | "state" | "remove" = "remove",
			value?: string
		) => {
			const index = nearbyCitiesList.indexOf(record);
			if (index == -1) return;

			const array = Array.from(nearbyCitiesList);

			if (type != "remove") {
				const updated: typeof record = {
					identifier: record.identifier,
					cityName: type == "city" ? value : record.cityName,
					state: type == "state" ? value : record.state,
				};

				array.splice(index, 1, updated);
			} else array.splice(index, 1);

			setNearbyCitiesList(array);
		},
		[nearbyCitiesList]
	);

	return (
		<div className={className}>
			<div className={classes.SectionHeader}>
				<Typography variant="h6">Miasta w pobliżu</Typography>
				{!readonly && (
					<Button
						size="small"
						className={classes.AddCityButton}
						onClick={addNewCityCallback}
					>
						Dodaj
					</Button>
				)}
			</div>

			<div className={classes.NearbyCitiesSection}>
				{nearbyCitiesList.length == 0 && (
					<div>
						<Typography textAlign="center">Brak danych</Typography>
					</div>
				)}

				{nearbyCitiesList.map((city) => {
					return (
						<div
							key={`${city.cityName}-${city.state}`}
							className={classes.NearbyCityWrapper}
						>
							<Autocomplete
								freeSolo={true}
								size="small"
								options={
									cities.length > 0
										? Array.from(
												new Set(
													cities.map(
														(opt) => opt.name
													)
												)
										  )
										: []
								}
								color="secondary"
								value={city.cityName}
								onChange={(_ev, value) =>
									modifyCityCallback(
										city,
										"city",
										value as string
									)
								}
								autoSelect={true}
								renderInput={(props) => (
									<TextField
										color="secondary"
										variant="filled"
										label="Miasto"
										value={city.cityName}
										error={city.cityName == ""}
										required
										helperText={
											city.cityName == "" ||
											city.state == undefined
												? "Uzupełnij pola."
												: cities?.find(
														(opt) =>
															city.cityName ==
																opt.name &&
															city.state ==
																opt.state.name
												  )
												? "Istniejące miaso zostanie użyte."
												: "Miasto zostanie dodane."
										}
										{...props}
									/>
								)}
								disabled={readonly}
							/>
							<TextField
								select
								size="small"
								color="secondary"
								variant="filled"
								label="Województwo"
								required
								onChange={(ev) =>
									modifyCityCallback(
										city,
										"state",
										ev.target.value as string
									)
								}
								value={city.state ?? ""}
								error={city.state == undefined}
								disabled={readonly}
							>
								{states?.map((state) => (
									<MenuItem key={state.id} value={state.name}>
										{state.name}
									</MenuItem>
								))}
							</TextField>
							{!readonly && (
								<>
									<Button
										className={c([
											classes.RemoveCityButton,
											classes.MobileButton,
										])}
										onClick={() => modifyCityCallback(city)}
									>
										Usuń
									</Button>
									<IconButton
										className={c([
											classes.RemoveCityButton,
											classes.DesktopButton,
										])}
										onClick={() => modifyCityCallback(city)}
									>
										<Close />
									</IconButton>
								</>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
