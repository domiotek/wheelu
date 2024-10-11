import { HTMLInputTypeAttribute, useContext, useLayoutEffect } from "react";
import classes from "./EditAccountPropertyModal.module.css";
import { ModalContext } from "../../components/ModalContainer/ModalContainer";
import { Alert, Button, Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "../../types/api";
import {
	callAPI,
	formatPolishWordSuffix,
	prepareFieldErrorMessage,
} from "../../modules/utils";
import { FormContainer, TextFieldElement, useForm } from "react-hook-form-mui";

interface IProps {
	userID: string;
	propKey: string;
	label: string;
	value: string;
	type: HTMLInputTypeAttribute;
	minLength?: number;
	maxLength?: number;
}

export default function EditAccountPropertyModal({
	userID,
	propKey,
	label,
	value: initalValue,
	type,
	minLength,
	maxLength,
}: IProps) {
	const { setHostClassName, closeModal } = useContext(ModalContext);

	const qClient = useQueryClient();
	const formContext = useForm<API.User.Update.IRequest>({
		defaultValues: {
			[propKey]: initalValue,
		},
	});

	const updateUserPropsMutation = useMutation<
		null,
		API.User.Update.IEndpoint["error"],
		API.User.Update.IRequest
	>({
		mutationFn: (data) =>
			callAPI<API.User.Update.IEndpoint>(
				"PUT",
				"/api/v1/auth/users/:userID",
				data,
				{ userID: userID }
			),
		onSuccess: () => {
			qClient.invalidateQueries({
				queryKey: ["Users", userID],
			});
			closeModal();
		},
	});

	useLayoutEffect(() => {
		setHostClassName(classes.Modal);
	}, []);

	return (
		<FormContainer
			FormProps={{ className: classes.Wrapper }}
			formContext={formContext}
			onSuccess={(data) => updateUserPropsMutation.mutate(data)}
		>
			<Typography
				variant="h6"
				className={
					!updateUserPropsMutation.isError ? classes.ExtraGutter : ""
				}
			>
				Zaktualizuj swoje dane
			</Typography>

			{updateUserPropsMutation.isError && (
				<Alert severity="error">
					Wystąpił problem przy przetwarzaniu żądania.
				</Alert>
			)}

			<TextFieldElement
				name={propKey}
				rules={{ minLength: minLength, maxLength: maxLength }}
				variant="filled"
				color="secondary"
				label={label}
				type={type}
				required
				InputLabelProps={{ shrink: type == "date" ? true : undefined }}
				parseError={(err) =>
					prepareFieldErrorMessage(err, {
						minLength: formatPolishWordSuffix(minLength ?? 0, [
							"znak",
							"znaki",
							"znaków",
						]),
						maxLength: formatPolishWordSuffix(maxLength ?? 0, [
							"znak",
							"znaki",
							"znaków",
						]),
					})
				}
			/>

			<div className={classes.ButtonsBar}>
				<Button onClick={() => closeModal()} color="secondary">
					Anuluj
				</Button>
				<Button
					variant="contained"
					color="secondary"
					type="submit"
					disabled={updateUserPropsMutation.isPending}
				>
					Zapisz
				</Button>
			</div>
		</FormContainer>
	);
}
