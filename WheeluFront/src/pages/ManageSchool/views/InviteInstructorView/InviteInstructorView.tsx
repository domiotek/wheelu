import { Alert, AlertTitle, Button, Typography } from "@mui/material";
import ViewWrapper from "../Wrapper";
import { FormContainer, TextFieldElement } from "react-hook-form-mui";
import classes from "./InviteInstructorView.module.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	callAPI,
	popUrlSegment,
	prepareFieldErrorMessage,
} from "../../../../modules/utils";
import { API } from "../../../../types/api";
import { useSnackbar } from "notistack";
import { useCallback, useContext } from "react";
import { AppContext } from "../../../../App";
import { SchoolPageContext } from "../../ManageSchoolPage";
import InstructorService from "../../../../services/Instructor";
import { useLocation, useNavigate } from "react-router-dom";

export default function InviteInstructorView() {
	const { snackBarProps } = useContext(AppContext);
	const { schoolData, queryKey } = useContext(SchoolPageContext);

	const snackBar = useSnackbar();
	const navigate = useNavigate();
	const location = useLocation();
	const qClient = useQueryClient();

	const submitMutation = useMutation<
		null,
		API.Instructors.SendInvite.IEndpoint["error"],
		API.Instructors.SendInvite.IRequest
	>({
		mutationFn: (data) =>
			callAPI<API.Instructors.SendInvite.IEndpoint>(
				"POST",
				"/api/v1/schools/:schoolID/instructors",
				data,
				{ schoolID: schoolData!.id }
			),
		onSuccess: () => {
			snackBar.enqueueSnackbar({
				...snackBarProps,
				message: "Zaproszenie zostało wysłane.",
				variant: "success",
			});
			navigate(popUrlSegment(location.pathname));
			qClient.invalidateQueries({
				queryKey: queryKey.concat(["Instructors", "Invites"]),
			});
		},
		onError: () =>
			snackBar.enqueueSnackbar({
				...snackBarProps,
				message: "Nie udało się wysłać zaproszenia.",
				variant: "error",
			}),
	});

	const submitCallback = useCallback(
		(data: API.Instructors.SendInvite.IRequest) => {
			submitMutation.mutate(data);
		},
		[]
	);

	return (
		<ViewWrapper headline="Zaproś instruktora">
			<div className={classes.Wrapper}>
				<Typography variant="body2">
					Wprowadź adres email instruktora, którego chcesz dodać na
					platformę - otrzyma on wiadomość z linkiem, który umożliwi
					mu utworzenie konta.
				</Typography>

				<Alert severity="info">
					<AlertTitle>Istniejący instruktor</AlertTitle>
					Jeśli instruktor, którego chcesz dodać już wcześniej
					korzystał z Wheelu, jako instruktor, nie musi on tworzyć
					nowego konta. Wprowadź jego adres email poniżej, a otrzyma
					link, który umożliwi mu połączenie jego konta z Twoją szkołą
					jazdy.
				</Alert>

				<FormContainer
					FormProps={{ className: classes.Form }}
					onSuccess={submitCallback}
				>
					{submitMutation.error && (
						<Alert severity="error">
							{InstructorService.translateInviteSubmitErrorCode(
								submitMutation.error.code
							)}
						</Alert>
					)}
					<TextFieldElement
						name="email"
						label="Email"
						type="email"
						size="small"
						color="secondary"
						required
						parseError={(err) =>
							prepareFieldErrorMessage(err, {
								pattern: "Podaj prawidłowy email.",
							})
						}
						disabled={submitMutation.isPending}
					/>

					<Button
						variant="contained"
						type="submit"
						color="secondary"
						disabled={submitMutation.isPending}
					>
						Wyślij
					</Button>
				</FormContainer>
			</div>
		</ViewWrapper>
	);
}
