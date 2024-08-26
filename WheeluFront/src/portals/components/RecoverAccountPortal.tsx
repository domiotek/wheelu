import { Button, Typography, Card, Stack, Alert } from "@mui/material";

import commonClasses from "../Common.module.css";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { callAPI, c, prepareFieldErrorMessage } from "../../modules/utils";
import { API } from '../../types/api';
import { FormContainer, TextFieldElement } from "react-hook-form-mui";

interface IFormFields {
	email: string
}

interface IProps {
	onSuccess: ()=>void
}

export default function RecoverAccountPortal({onSuccess}: IProps) {
	const formContext = useForm<IFormFields>();

	const submitMutation = useMutation<null,API.Auth.RecoverPassword.IEndpoint["error"], API.Auth.RecoverPassword.IRequestData>({
        mutationFn: data=>callAPI<API.Auth.RecoverPassword.IEndpoint>("POST","/api/v1/auth/recover-account",data, null, true),
        onSuccess
    });

	const onSubmit = (val: IFormFields)=>{
		submitMutation.mutate({
			Email: val.email
		});
	}

	return (
		<Card sx={{width: "100%", maxWidth: 420, m: 2, p: {xs: 2, sm: 4}}}>
			<Stack alignItems="center" gap="2em">
				<img className={commonClasses.Logo} src="/logo.png" alt="Wheelu Logo" />
				<Typography variant="h5">Odzyskaj dostęp</Typography>
				<Typography>Podaj adres email konta, do którego chcesz odzyskać dostęp.</Typography>
				<FormContainer FormProps={{className: commonClasses.Form}} onSuccess={onSubmit} formContext={formContext}>
					<Alert className={c([commonClasses.ErrorPanel, [commonClasses.Visible, submitMutation.error!=null] ])} severity="error">
						Nie możemy teraz przetworzyć tego żądania.
					</Alert>
					<Stack className={commonClasses.InputContainer}>
						<TextFieldElement 
							name="email"
							className={commonClasses.Input}
							color="secondary"
							variant="filled" 
							label="Adres email" 
							type="email" 
							autoComplete="username"
							required
							parseError={(err)=>prepareFieldErrorMessage(err, {pattern: "Podaj prawidłowy email."})}
						/>
					</Stack>
				
					<Button type="submit" variant="contained" sx={{mt: 2, mb: 1}} disabled={submitMutation.isPending}>Potwierdź</Button>
				</FormContainer>
			</Stack>
		</Card>
  );
}
