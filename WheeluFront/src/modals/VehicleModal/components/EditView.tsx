import VehiclePartGauge from "../../../components/VehiclePartGauge/VehiclePartGauge";
import CategoriesWidget from "../../../components/CategoriesWidget/CategoriesWidget";
import {
	Button,
	ButtonBase,
	Collapse,
	List,
	ListItem,
	ListItemText,
	Typography,
} from "@mui/material";
import classes from "../VehicleModal.module.css";
import {
	FormContainer,
	SelectElement,
	TextFieldElement,
	useForm,
} from "react-hook-form-mui";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { c, callAPI, prepareFieldErrorMessage } from "../../../modules/utils";
import { Error, ExpandLess, ExpandMore } from "@mui/icons-material";
import { CourseCategory } from "../../../modules/enums";
import ModalContainer from "../../../components/ModalContainer/ModalContainer";
import UploadImageModal, {
	IFileData,
} from "../../UploadImageModal/UploadImageModal";
import { DateTime } from "luxon";
import { API } from "../../../types/api";
import { useMutation } from "@tanstack/react-query";
import VehicleService from "../../../services/Vehicle.tsx";
import { AppContext } from "../../../App.tsx";
import LazyBackendImage from "../../../components/LazyBackendImage/LazyBackendImage.tsx";

interface IProps {
	schoolID: number;
	data?: App.Models.IVehicle;
	parts: App.UI.IVehiclePartDef;
	hideNote?: boolean;
	onBack: () => void;
	onSuccess: () => void;
}

export default function EditView({
	schoolID,
	data,
	parts,
	hideNote,
	onBack,
	onSuccess,
}: IProps) {
	const [expandEngineSection, setExpandEngineSection] = useState(false);
	const [newAllowedCategories, setNewAllowedCategories] = useState<
		CourseCategory[]
	>([]);
	const [settingImage, setSettingImage] = useState(false);
	const [noteLength, setNoteLength] = useState(0);
	const [coverPhotoName, setCoverPhotoName] = useState<string>("");
	const [coverPhoto, setCoverPhoto] = useState<IFileData | null>(null);
	const [coverPhotoPreview, setCoverPhotoPreview] = useState<any>(null);
	const [partReplaceDates, setPartReplaceDates] = useState<
		Record<number, DateTime | null>
	>({});

	const formContext = useForm<App.Models.IVehicleProps>();
	const { activeThemeName } = useContext(AppContext);

	const saveChanges = useMutation<
		null,
		API.Vehicles.CreateOrUpdate.IEndpoint["error"],
		FormData
	>({
		mutationFn: (submitData) =>
			callAPI<API.Vehicles.CreateOrUpdate.IEndpoint>(
				data ? "PUT" : "POST",
				data
					? "/api/v1/schools/:schoolID/vehicles/:vehicleID"
					: "/api/v1/schools/:schoolID/vehicles",
				submitData,
				{ schoolID, vehicleID: data?.id ?? -1 }
			),
		onSuccess,
	});

	const submitCallback = useCallback(
		(data: App.Models.IVehicleProps) => {
			const formData = new FormData();
			for (const prop in data) {
				if ((data as any)[prop] != undefined)
					formData.set(prop, (data as any)[prop]);
			}

			for (let i = 0; i < newAllowedCategories.length; i++) {
				formData.set(
					`allowedIn[${i}]`,
					newAllowedCategories[i].toString()
				);
			}

			const partTypes = Object.keys(partReplaceDates);

			for (let i = 0; i < partTypes.length; i++) {
				const partType = parseInt(partTypes[i]);
				const date = partReplaceDates[partType];
				if (date == null) continue;

				formData.set(`parts[${i}].partType`, partType.toString());

				formData.set(`parts[${i}].lastCheckDate`, date.toISODate()!);
			}

			if (coverPhoto) formData.set("image", coverPhoto.blob);

			saveChanges.mutate(formData);
		},
		[coverPhoto, newAllowedCategories, partReplaceDates]
	);

	const modifyAllowedCategoriesState = useCallback(
		(category: CourseCategory) => {
			const newState = [...newAllowedCategories];

			if (newState.includes(category)) {
				newState.splice(newState.indexOf(category), 1);
			} else newState.push(category);

			setNewAllowedCategories(newState);
		},
		[newAllowedCategories]
	);

	const partComponets = useMemo(() => {
		const result = [];

		for (const partID in parts) {
			result.push(
				<VehiclePartGauge
					key={partID}
					name={parts[partID].name}
					editable={true}
					imageSrc={parts[partID].icon}
					className={c([
						classes.VehiclePart,
						[classes.DarkMode, activeThemeName == "dark"],
					])}
					replacedDate={partReplaceDates[partID] ?? undefined}
					lifeSpan={parts[partID].lifespan ?? undefined}
					onChange={(date) =>
						setPartReplaceDates({
							...partReplaceDates,
							[partID]: date,
						})
					}
				/>
			);
		}
		return result;
	}, [partReplaceDates]);

	const engineText = useMemo(() => {
		const values = formContext.getValues();
		return VehicleService.getEngineText({
			displacement: values["displacement"],
			power: values["power"],
			transmissionSpeedCount: values["transmissionSpeedCount"],
			transmissionType: values["transmissionType"],
		});
	}, [formContext.watch()]);

	useEffect(() => {
		const newDates: typeof partReplaceDates = {};
		for (const partID in parts) {
			newDates[partID] = parts[partID].lastCheckDate;
		}
		setPartReplaceDates(newDates);

		if (!data) return;

		setNewAllowedCategories(data.allowedIn);

		for (const key in formContext.getValues()) {
			formContext.setValue(
				key as keyof App.Models.IVehicleProps,
				(data as any)[key]
			);
		}
	}, [data]);

	return (
		<>
			<div className={classes.Overview}>
				<div
					className={c([
						classes.CoverImage,
						classes.ImageEditContainer,
					])}
				>
					{coverPhotoPreview ? (
						<img
							className={classes.CoverImage}
							src={coverPhotoPreview}
							alt="Vehicle image"
						/>
					) : (
						<LazyBackendImage
							className={classes.CoverImage}
							url={
								data?.coverImage.url ??
								"https://localhost:9090/static/placeholder.png"
							}
							alt="Vehicle image"
						/>
					)}
					<div className={classes.Cover}></div>
					<div className={classes.ButtonsBar}>
						<Button
							variant="outlined"
							onClick={() => setSettingImage(true)}
						>
							Zmień
						</Button>
					</div>
				</div>

				<div className={classes.VehicleParts}>
					{partComponets.map((comp) => comp)}
				</div>
			</div>

			<CategoriesWidget
				className={classes.CategoriesWidget}
				enabledList={new Set(newAllowedCategories)}
				onChipClick={modifyAllowedCategoriesState}
			/>
			<FormContainer
				FormProps={{ className: classes.PropsContainer }}
				formContext={formContext}
				onSuccess={submitCallback}
			>
				<List>
					<ListItem divider>
						<TextFieldElement
							name="model"
							rules={{ maxLength: 50 }}
							label="Model"
							size="small"
							color="secondary"
							required
							parseError={(err) =>
								prepareFieldErrorMessage(err, {
									maxLength: "50 znaków",
								})
							}
						/>
					</ListItem>
					<ListItem divider>
						<TextFieldElement
							name="manufacturingYear"
							type="number"
							required
							rules={{ min: 1, max: 9999 }}
							label="Rocznik"
							size="small"
							color="secondary"
							parseError={prepareFieldErrorMessage}
						/>
					</ListItem>
				</List>
				<List>
					<ListItem className={classes.EngineSection} divider>
						<ButtonBase
							className={classes.ValuePreview}
							onClick={() =>
								setExpandEngineSection(!expandEngineSection)
							}
						>
							<ListItemText
								primary="Silnik i skrzynia biegów"
								secondary={engineText}
							/>
							{expandEngineSection ? (
								<ExpandLess />
							) : (
								<ExpandMore />
							)}
						</ButtonBase>

						<div
							className={c([
								classes.InputsWrapper,
								[classes.Expanded, expandEngineSection],
							])}
						>
							<TextFieldElement
								name="displacement"
								rules={{ min: 0 }}
								label="Pojemność silnika (L)"
								size="small"
								color="secondary"
								parseError={prepareFieldErrorMessage}
							/>
							<TextFieldElement
								name="power"
								rules={{ min: 0 }}
								label="Moc"
								size="small"
								color="secondary"
								parseError={prepareFieldErrorMessage}
							/>
							<TextFieldElement
								name="transmissionSpeedCount"
								label="Ilość biegów"
								size="small"
								color="secondary"
								rules={{ min: 1 }}
								parseError={prepareFieldErrorMessage}
							/>
							<SelectElement
								name="transmissionType"
								label="Typ skrzyni"
								size="small"
								color="secondary"
								options={VehicleService.getTransmissionTypes()}
								labelKey="label"
								valueKey="id"
							/>
						</div>
					</ListItem>
					<ListItem divider sx={{ alignItems: "flex-start" }}>
						<TextFieldElement
							name="mileage"
							type="number"
							rules={{ min: 0 }}
							label="Przebieg (km)"
							size="small"
							color="secondary"
							parseError={prepareFieldErrorMessage}
						/>
					</ListItem>
				</List>
				<List>
					<ListItem divider>
						<TextFieldElement
							name="plate"
							label="Numer rejestracyjny"
							size="small"
							color="secondary"
							required
							parseError={prepareFieldErrorMessage}
						/>
					</ListItem>
					<ListItem divider>
						<TextFieldElement
							name="lastInspection"
							type="date"
							label="Ostatni przegląd"
							size="small"
							color="secondary"
							InputLabelProps={{ shrink: true }}
						/>
					</ListItem>
				</List>
				{!hideNote && (
					<List>
						<ListItem>
							<TextFieldElement
								name="note"
								rules={{ maxLength: 255 }}
								label="Notatka"
								multiline
								color="secondary"
								maxRows={4}
								sx={{ width: 1.0 }}
								inputProps={{ maxLength: 255 }}
								parseError={(err) =>
									prepareFieldErrorMessage(err, {
										maxLength: "255 znaków",
									})
								}
								onChange={(e) =>
									setNoteLength(e.target.value.length)
								}
								helperText={`${noteLength}/255`}
							/>
						</ListItem>
					</List>
				)}
				<div className={classes.ButtonsBar}>
					<Collapse
						className={classes.ErrMessageWrapper}
						in={saveChanges.isError}
						orientation="vertical"
					>
						<div className={classes.ErrMessage}>
							<Error color="error" />
							<Typography variant="caption" mt={0.5}>
								Nie udało się zapisać zmian
							</Typography>
						</div>
					</Collapse>
					<Button size="small" onClick={() => onBack()}>
						Anuluj
					</Button>
					<Button variant="contained" type="submit">
						Zapisz
					</Button>
				</div>
			</FormContainer>

			<ModalContainer
				show={settingImage}
				onClose={() => setSettingImage(false)}
			>
				<UploadImageModal
					images={coverPhoto ? { [coverPhotoName]: coverPhoto } : {}}
					onUpdate={(img) => {
						const filename = Object.keys(img)[0];

						setCoverPhotoName(filename ?? "");
						setCoverPhoto(img[filename] ?? null);
						setCoverPhotoPreview(img[filename]?.preview);
					}}
				/>
			</ModalContainer>
		</>
	);
}
