import { Alert, Button, Card, Stack, TextField, Typography } from "@mui/material";
import commonClasses from "./Common.module.css";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { API } from "../types/api";
import { useMutation } from "@tanstack/react-query";
import { c, callAPI } from "../modules/utils";

interface IFormFields {
	email: string
}

export default function ResendActivationPortal() {
	const {
		control,
		handleSubmit
	} = useForm<IFormFields>({defaultValues: {email: ""}});

	const [requestState, setRequestState] = useState<"success" | "failure" | null>(null);

	const submitMutation = useMutation<null, API.Auth.ResendActivation.IEndpoint["error"], API.Auth.ResendActivation.IRequestData>({
        mutationFn: data=>callAPI<API.Auth.ResendActivation.IEndpoint>("POST","/api/v1/auth/resend-activation",data, null, true),
        onSuccess: ()=>setRequestState("success"),
		onError: (()=>setRequestState("failure"))
    });

	const onSubmit = (val: IFormFields)=>{
		setRequestState(null);
		submitMutation.mutate({
			Email: val.email
		});
	}

	return (
		<Card sx={{maxWidth: 420, width: "100%", m: 2, p: {xs: 2, sm: 4}}}>
			<Stack alignItems="center" gap="0.5em">
				<img className={commonClasses.Logo} src="/logo.png" alt="Wheelu Logo" />
				<Typography variant="h5" gutterBottom>Wyślij link aktywacyjny</Typography>
				<Typography variant="body2" sx={{fontSize: "0.8em", fontWeight: "300"}} gutterBottom>
					Czasem to się zdarza! Jeśli nie dotarła do Ciebie wiadomość z linkiem aktywacynjnym, możemy spróbować wysłać ją jeszcze raz.
				</Typography>

				<form className={commonClasses.Form} onSubmit={handleSubmit(onSubmit)}>
					<Alert className={c([commonClasses.ErrorPanel, [commonClasses.Visible, requestState!=null] ])} severity={requestState=="success"?"success":"error"}>
						{
							requestState=="success"?"Poszło! Sprawdź skrzynkę.":"Coś poszło nie tak po naszej stronie."
						}
					</Alert>
					<Controller
						name="email"
						control={control}
						rules={{required: true}}
						render={({field})=> 
							<TextField
								color="secondary"
								className={commonClasses.Input} 
								variant="filled" 
								label="Email"
								type="email" 
								autoComplete="username"
								required
								{...field}
							/>
						}
					/>

					<Button type="submit" variant="contained" sx={{mb: 1}} disabled={submitMutation.isPending}>Wyślij</Button>
				</form>
			</Stack>
		</Card>
	)
}
