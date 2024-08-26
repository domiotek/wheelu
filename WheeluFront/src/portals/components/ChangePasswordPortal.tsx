import { Button, Typography, Card, Stack, Alert } from "@mui/material";

import commonClasses from "../Common.module.css";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { callAPI, c } from "../../modules/utils";
import { API } from '../../types/api';
import { FormContainer, TextFieldElement } from "react-hook-form-mui";

interface IFormFields {
	password: string
	cpassword: string
}

interface IProps {
	onSuccess: ()=>void
	token: string
}

export default function ChangePasswordPortal({onSuccess, token}: IProps) {
	const formContext = useForm<IFormFields>();

	const submitMutation = useMutation<null,API.Auth.ChangePassword.IEndpoint["error"], API.Auth.ChangePassword.IRequestData>({
        mutationFn: data=>callAPI<API.Auth.ChangePassword.IEndpoint>("POST","/api/v1/auth/change-password",data, null, true),
        onSuccess
    });

	const onSubmit = (val: IFormFields)=>{
		submitMutation.mutate({
			Password: val.password,
			Token: token
		});
	}

	return (
		<Card sx={{width: "100%", maxWidth: 420, m: 2, p: {xs: 2, sm: 4}}}>
			<Stack alignItems="center" gap="0.5em">
				<img className={commonClasses.Logo} src="/logo.png" alt="Wheelu Logo" />
				<Typography variant="h5">Ustaw hasło</Typography>
				<FormContainer FormProps={{className: commonClasses.Form}} onSuccess={onSubmit} formContext={formContext}>
					<Alert className={c([commonClasses.ErrorPanel, [commonClasses.Visible, submitMutation.error!=null] ])} severity="error">
						{
							submitMutation.error?.code=="PasswordRequirementsNotMet"?
								"Hasło nie spełnia wymagań."
								:
								"Nie możemy teraz przetworzyć tego żądania."
						}
					</Alert>
					<Stack className={commonClasses.InputContainer}>
						<TextFieldElement 
							name="password"
							rules={{required: true, minLength: 6, pattern: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-_]).{6,}$/}}
							className={commonClasses.Input}
							color="secondary"
							variant="filled" 
							label="Hasło" 
							type="password" 
							autoComplete="new-password"
							required
							error={formContext.formState.errors.password!=undefined}
							helperText={
								formContext.formState.errors.password!=undefined?
								"Hasło musi mieć conajmniej 6 znaków, w tym 1 wielką, 1 małą literę, 1 cyfrę oraz znak specjalny."
								:
								undefined
							}
						/>

						<TextFieldElement 
							name="cpassword"
							rules={{required: true, validate: (value, fields)=>fields.password==value}}
							className={commonClasses.Input}
							color="secondary"
							variant="filled" 
							label="Potwierdź hasło"
							type="password" 
							autoComplete="new-password"
							required
							error={formContext.formState.errors.cpassword!=undefined}
							helperText={
								formContext.formState.errors.cpassword!=undefined?
								"Hasło różni się od tego podanego wcześniej."
								:
								undefined
							}
						/>
					</Stack>
				
					<Button type="submit" variant="contained" sx={{mt: 2, mb: 1}} disabled={submitMutation.isPending}>Potwierdź</Button>
				</FormContainer>
			</Stack>
		</Card>
	)
}
