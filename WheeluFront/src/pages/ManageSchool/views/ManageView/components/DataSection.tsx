import {
	FormContainer,
	SelectElement,
	TextFieldElement,
	useForm,
} from "react-hook-form-mui";
import {
	callAPI,
	prepareFieldErrorMessage,
} from "../../../../../modules/utils";
import NearbyCitiesEditWidget from "../../../../../components/NearbyCitiesEditWidget/NearbyCitiesEditWidget";
import classes from "../Manage.module.css";
import { useCallback, useContext, useEffect, useState } from "react";
import { API } from "../../../../../types/api";
import { Alert, Button, Typography } from "@mui/material";
import { AppContext } from "../../../../../App";
import UploadImageModal, {
	IFileData,
} from "../../../../../modals/UploadImageModal/UploadImageModal";
import { SchoolPageContext } from "../../../ManageSchoolPage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import SchoolService from "../../../../../services/School";
import { toast } from "react-toastify";

interface IProps {
	cities: App.Models.ICity[];
	states: App.Models.IState[];
	isAdmin: boolean;
	disabled?: boolean;
	readonly: boolean;
	onSavingChanges: (isSavingChanges: boolean) => void;
}

export default function DataSection({
	cities,
	states,
	isAdmin,
	disabled,
	readonly,
	onSavingChanges,
}: IProps) {
	const [nearbyCitiesList, setNearbyCitiesList] = useState<
		Partial<App.Models.ICityMatching>[]
	>([]);

	const [coverPhotoName, setCoverPhotoName] = useState<string>("");
	const [coverPhoto, setCoverPhoto] = useState<IFileData | null>(null);
	const [descriptionLength, setDescriptionLength] = useState<number>(0);
	const [preSubmitting, setPreSubmitting] = useState(false);

	const params = useParams();
	const { setModalContent } = useContext(AppContext);
	const { setCoverPhotoPreview, schoolData } = useContext(SchoolPageContext);
	const formContext = useForm<API.School.Update.IRequestData>();
	const qClient = useQueryClient();

	const saveChanges = useMutation<
		null,
		API.School.Update.IEndpoint["error"],
		FormData
	>({
		mutationFn: (data) =>
			callAPI<API.School.Update.IEndpoint>(
				"PUT",
				"/api/v1/schools/:id",
				data as any,
				{ id: params["id"] ?? "" }
			),
		onSuccess: async () => {
			qClient.invalidateQueries({
				queryKey: ["Schools", "#", parseInt(params["id"]!)],
			});

			toast.success("Pomyślnie zapisano zmiany.");
			onSavingChanges(false);
		},
		onError: (err) => {
			toast.error(
				`Wystąpił problem podczas zapisywania zmian profilu. ${SchoolService.translateSchoolUpdateErrorCode(
					err.code
				)}`
			);
			onSavingChanges(false);
		},
	});

	const submitCallback = useCallback(async () => {
		setPreSubmitting(true);
		await new Promise((r) => setTimeout(r, 0));
		const data = formContext.getValues();
		setPreSubmitting(false);

		const formData = new FormData();

		for (const prop in data) {
			if (data[prop]) formData.set(prop, data[prop]);
		}

		if (data.subBuildingNumber == undefined)
			formData.delete("subBuildingNumber");

		for (let i = 0; i < nearbyCitiesList.length; i++) {
			const city = nearbyCitiesList[i];

			if (city.identifier)
				formData.set(
					`nearbyCities[${i}].Id`,
					city.identifier.toString()
				);
			if (city.cityName)
				formData.set(`nearbyCities[${i}].Name`, city.cityName);
			formData.set(`nearbyCities[${i}].State`, city.state ?? "");
		}

		if (coverPhoto) formData.set("coverPhoto", coverPhoto.blob);

		saveChanges.mutate(formData);
		onSavingChanges(true);
	}, [nearbyCitiesList, coverPhoto]);

	const updatePhotoButtonClick = useCallback(() => {
		setModalContent(
			<UploadImageModal
				images={coverPhoto ? { [coverPhotoName]: coverPhoto } : {}}
				onUpdate={(img) => {
					const filename = Object.keys(img)[0];

					setCoverPhotoName(filename ?? "");
					setCoverPhoto(img[filename] ?? null);
					setCoverPhotoPreview(img[filename]?.preview);
				}}
			/>
		);
	}, [coverPhoto]);

	useEffect(() => {
		if (!schoolData) return;

		const formProps = Object.keys(formContext.getValues());

		formContext.setValue("name", schoolData.name);
		formContext.setValue("nip", schoolData.nip);
		formContext.setValue("phoneNumber", schoolData.phoneNumber);
		formContext.setValue("email", schoolData.email);
		formContext.setValue("description", schoolData.description ?? "");
		setDescriptionLength(schoolData.description?.length ?? 0);

		for (const prop in schoolData.address) {
			const value = (schoolData.address as any as Record<string, string>)[
				prop
			];

			if (formProps.includes(prop)) formContext.setValue(prop, value);
		}

		setNearbyCitiesList(
			schoolData.nearbyCities.map((city) => {
				const cityMatching: Partial<App.Models.ICityMatching> = {
					identifier: city.id,
					cityName: city.name,
					state: city.state.name,
				};

				return cityMatching;
			})
		);
	}, [schoolData]);

	return (
		<FormContainer
			FormProps={{ className: classes.Form }}
			formContext={formContext}
			onSuccess={submitCallback}
		>
			{!readonly && (
				<Button
					className={classes.UpdatePhotoButton}
					color="secondary"
					onClick={updatePhotoButtonClick}
					disabled={saveChanges.isPending || disabled}
				>
					Zmień zdjęcie {coverPhoto ? `(${coverPhotoName})` : ""}
				</Button>
			)}

			<Typography variant="h6">Podstawowe informacje</Typography>
			<div className={classes.InputGroup}>
				<TextFieldElement
					name="name"
					color="secondary"
					rules={{ maxLength: 50 }}
					variant="filled"
					label="Nazwa"
					type="text"
					required
					parseError={prepareFieldErrorMessage}
					disabled={saveChanges.isPending || disabled}
				/>

				<TextFieldElement
					name="nip"
					color="secondary"
					rules={{ pattern: /^\d{10}$/ }}
					variant="filled"
					label="NIP"
					type="text"
					required
					inputProps={{ maxLength: 10 }}
					parseError={(err) =>
						prepareFieldErrorMessage(err, {
							pattern: "Niewłaściwy format NIP.",
						})
					}
					disabled={
						!preSubmitting &&
						(!isAdmin || saveChanges.isPending || disabled)
					}
				/>
			</div>
			<div className={classes.InputGroup}>
				<TextFieldElement
					name="email"
					type="email"
					color="secondary"
					variant="filled"
					label="Email kontaktowy"
					required
					parseError={(err) =>
						prepareFieldErrorMessage(err, {
							pattern: "Niepoprawny adres email.",
						})
					}
					disabled={saveChanges.isPending || disabled}
				/>
				<TextFieldElement
					name="phoneNumber"
					rules={{
						minLength: 9,
						maxLength: 16,
						pattern:
							/(?<!\w)(\(?(\+|00)?48\)?)?[ -]?\d{3}[ -]?\d{3}[ -]?\d{3}(?!\w)/,
					}}
					color="secondary"
					variant="filled"
					label="Numer telefonu"
					autoComplete="tel"
					required
					parseError={(err) =>
						prepareFieldErrorMessage(err, {
							pattern: "Niewłaściwy format numeru telefonu.",
							maxLength: "16 znaków",
						})
					}
					disabled={saveChanges.isPending || disabled}
				/>
			</div>
			<div className={classes.InputGroup}>
				<TextFieldElement
					name="description"
					variant="filled"
					rules={{ maxLength: 250 }}
					label="Opis"
					color="secondary"
					maxRows={3}
					multiline={true}
					inputProps={{ maxLength: 250 }}
					parseError={(err) =>
						prepareFieldErrorMessage(err, {
							maxLength: "250 znaków",
						})
					}
					helperText={`${
						descriptionLength ??
						formContext.getValues()["description"]?.length
					} / 250 znaków`}
					onChange={(e) =>
						setDescriptionLength(e.target.value.length)
					}
					disabled={saveChanges.isPending || disabled}
				/>
			</div>

			<Typography variant="h6">Adres szkoły</Typography>
			{!isAdmin && !readonly && (
				<Alert severity="info">
					Aby zmienić adres siedziby szkoły, skontaktuj się z
					administratorem.
				</Alert>
			)}

			<div className={classes.InputGroup}>
				<TextFieldElement
					name="street"
					rules={{ minLength: 2, maxLength: 75 }}
					color="secondary"
					variant="filled"
					label="Ulica"
					required
					parseError={(err) =>
						prepareFieldErrorMessage(err, {
							minLength: "2 znaki",
							maxLength: "75 znaków",
						})
					}
					disabled={
						!preSubmitting &&
						(!isAdmin || saveChanges.isPending || disabled)
					}
				/>

				<TextFieldElement
					name="buildingNumber"
					color="secondary"
					rules={{ maxLength: 10 }}
					variant="filled"
					label="Numer budynku"
					required
					parseError={(err) =>
						prepareFieldErrorMessage(err, {
							maxLength: "10 znaków",
						})
					}
					disabled={
						!preSubmitting &&
						(!isAdmin || saveChanges.isPending || disabled)
					}
				/>

				<TextFieldElement
					name="subBuildingNumber"
					rules={{ min: 1 }}
					color="secondary"
					variant="filled"
					label="Numer lokalu"
					type="number"
					parseError={(err) =>
						prepareFieldErrorMessage(err, { min: 1 })
					}
					disabled={
						!preSubmitting &&
						(!isAdmin || saveChanges.isPending || disabled)
					}
				/>
			</div>
			<div className={classes.InputGroup}>
				<TextFieldElement
					name="zipCode"
					rules={{
						minLength: 6,
						maxLength: 6,
						pattern: /\d{2}-\d{3}/,
					}}
					color="secondary"
					variant="filled"
					label="Kod pocztowy"
					required
					parseError={(err) =>
						prepareFieldErrorMessage(err, {
							pattern: "Niewłaściwy format kodu pocztowego.",
						})
					}
					disabled={
						!preSubmitting &&
						(!isAdmin || saveChanges.isPending || disabled)
					}
				/>

				<TextFieldElement
					name="city"
					rules={{ minLength: 2, maxLength: 50 }}
					color="secondary"
					variant="filled"
					label="Miasto"
					required
					parseError={(err) =>
						prepareFieldErrorMessage(err, {
							minLength: "2 znaki",
							maxLength: "50 znaków",
						})
					}
					helperText={
						cities?.find((opt) => {
							const currValue = formContext.getValues();
							return (
								currValue.city == "" ||
								(currValue["city"] == opt.name &&
									currValue["state"] == opt.state.name)
							);
						}) || formContext.getValues().city == undefined
							? ""
							: "Miasto zostanie dodane"
					}
					disabled={
						!preSubmitting &&
						(!isAdmin || saveChanges.isPending || disabled)
					}
				/>

				<div className={classes.InputGroup}>
					<SelectElement
						name="state"
						required
						color="secondary"
						variant="filled"
						label="Województwo"
						options={states}
						valueKey="name"
						labelKey="name"
						parseError={prepareFieldErrorMessage}
						disabled={
							!preSubmitting &&
							(!isAdmin || saveChanges.isPending || disabled)
						}
					/>
				</div>
			</div>

			<NearbyCitiesEditWidget
				className={classes.NearbyCitiesSection}
				cities={cities}
				states={states}
				nearbyCitiesList={nearbyCitiesList}
				setNearbyCitiesList={setNearbyCitiesList}
				readonly={!isAdmin || saveChanges.isPending || disabled}
			/>

			{!readonly && (
				<Button
					className={classes.SubmitButton}
					variant="contained"
					type="submit"
					color="secondary"
					disabled={saveChanges.isPending || disabled}
				>
					Zapisz
				</Button>
			)}
		</FormContainer>
	);
}
