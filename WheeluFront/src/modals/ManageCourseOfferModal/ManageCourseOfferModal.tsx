import { useCallback, useContext, useLayoutEffect, useMemo } from "react";
import { ModalContext } from "../../components/ModalContainer/ModalContainer";
import classes from "./ManageCourseOfferModal.module.css";
import { Alert, Button, Typography } from "@mui/material";
import {
	CheckboxElement,
	FormContainer,
	SelectElement,
	TextFieldElement,
	useForm,
} from "react-hook-form-mui";
import { callAPI, prepareFieldErrorMessage } from "../../modules/utils";
import { App } from "../../types/app";
import { useMutation } from "@tanstack/react-query";
import { API } from "../../types/api";
import { useSnackbar } from "notistack";
import { AppContext } from "../../App";
import { CourseCategoriesMapping } from "../../modules/constants";

interface ICommonProps {
	onSuccess?: () => void;
}

interface ICreateProps {
	mode: "create";
	data?: undefined;
	schoolID: string;
}

interface IUpdateProps {
	mode: "update";
	data: App.Models.ICourseOffer;
	schoolID?: undefined;
}

type IProps = ICommonProps & (ICreateProps | IUpdateProps);

export default function ManageCourseOfferModal({
	mode,
	data,
	schoolID,
	onSuccess,
}: IProps) {
	const { snackBarProps } = useContext(AppContext);
	const { setHostClassName, closeModal } = useContext(ModalContext);
	const formContext = useForm<API.Offers.Courses.Create.IRequestData>({
		defaultValues: { ...data, category: data?.category.id },
	});
	const snackBar = useSnackbar();

	const successCalback = useCallback(() => {
		onSuccess && onSuccess();
		closeModal();
	}, []);

	const createMutation = useMutation<
		null,
		API.Offers.Courses.Create.IEndpoint["error"],
		API.Offers.Courses.Create.IRequestData
	>({
		mutationFn: (data) =>
			callAPI<API.Offers.Courses.Create.IEndpoint>(
				"POST",
				"/api/v1/offers",
				data
			),
		onSuccess: successCalback,
		onError: () =>
			snackBar.enqueueSnackbar({
				...snackBarProps,
				message: "Nie udało się utworzyć kursu",
				variant: "error",
			}),
	});

	const updateMutation = useMutation<
		null,
		API.Offers.Courses.Update.IEndpoint["error"],
		API.Offers.Courses.Update.IRequestData
	>({
		mutationFn: (newData) =>
			callAPI<API.Offers.Courses.Update.IEndpoint>(
				"PUT",
				"/api/v1/offers/:id",
				newData,
				{ id: data!.id }
			),
		onSuccess: successCalback,
		onError: () =>
			snackBar.enqueueSnackbar({
				...snackBarProps,
				message: "Nie udało się edytować kursu",
				variant: "error",
			}),
	});

	const submitCallback = useCallback(
		(data: API.Offers.Courses.Create.IRequestData) => {
			if (mode == "create")
				createMutation.mutate({
					...data,
					schoolID: parseInt(schoolID ?? ""),
				});
			else updateMutation.mutate(data);
		},
		[]
	);

	const disabledFlag = useMemo(() => {
		return createMutation.isPending;
	}, [createMutation.isPending]);

	useLayoutEffect(() => {
		setHostClassName(classes.Modal);
	}, []);

	return (
		<div className={classes.ModalContent}>
			<Typography variant="h5">
				{mode == "create" ? "Dodaj" : "Zmień"} ofertę kursu
			</Typography>
			<FormContainer
				FormProps={{ className: classes.Form }}
				formContext={formContext}
				onSuccess={submitCallback}
			>
				{mode == "update" && (
					<Alert severity="info">
						Dokonane zmiany nie wpłyną na kursantów, którzy już
						wykupili ten kurs.
					</Alert>
				)}
				<CheckboxElement
					name="enabled"
					color="secondary"
					label="Aktywny"
					disabled={disabledFlag}
				/>
				{mode == "create" && (
					<SelectElement
						name="category"
						required={mode == "create"}
						color="secondary"
						variant="outlined"
						label="Kategoria"
						options={CourseCategoriesMapping}
						valueKey="id"
						labelKey="name"
						parseError={prepareFieldErrorMessage}
						disabled={disabledFlag}
					/>
				)}

				<TextFieldElement
					name="hoursCount"
					color="secondary"
					variant="outlined"
					label="Ilość godzin"
					type="number"
					rules={{ min: 1 }}
					required
					parseError={prepareFieldErrorMessage}
					disabled={disabledFlag}
				/>
				<TextFieldElement
					name="price"
					color="secondary"
					variant="outlined"
					label="Cena za kurs (zł)"
					type="number"
					required
					rules={{ min: 1 }}
					parseError={prepareFieldErrorMessage}
					disabled={disabledFlag}
				/>
				<TextFieldElement
					name="pricePerHour"
					color="secondary"
					variant="outlined"
					label="Cena za dodatkową godzinę (zł)"
					type="number"
					rules={{ min: 1 }}
					required
					parseError={prepareFieldErrorMessage}
					disabled={disabledFlag}
				/>

				<div className={classes.ButtonsBar}>
					<Button
						type="button"
						variant="outlined"
						color="secondary"
						onClick={closeModal}
					>
						Anuluj
					</Button>
					<Button
						type="submit"
						variant="contained"
						color="secondary"
						disabled={disabledFlag}
					>
						Zapisz
					</Button>
				</div>
			</FormContainer>
		</div>
	);
}
