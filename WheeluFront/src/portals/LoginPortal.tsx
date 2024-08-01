import { Alert, Button, Card, Checkbox, FormControlLabel, Link, Stack, TextField, Typography } from "@mui/material";
import commonClasses from "./Common.module.css";
import { useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { callAPI, resolveClasses } from "../modules/utils";
import { API } from "../types/api";
import { useState } from "react";

interface IFormFields {
	email: string
	password: string
	rememberMe: boolean
}


export default function LoginPortal() {
	const {
		control,
		handleSubmit
	} = useForm<IFormFields>(
		{
			defaultValues: {
				email: "", password: "", rememberMe: false
			}
		}
	);

	const [errorState, setErrorState] = useState<API.Auth.SignIn.IEndpoint["errCodes"] | null>(null);

	const queryClient = useQueryClient();

	const submitMutation = useMutation<API.Auth.SignIn.IResponse, API.Auth.SignIn.IEndpoint["error"], API.Auth.SignIn.IRequestData>({
        mutationFn: data=>callAPI<API.Auth.SignIn.IEndpoint>("POST","/api/v1/auth/signin",data, null, true),
        onSuccess: async data=>{
			localStorage.setItem("token", data.token);
			queryClient.invalidateQueries({queryKey: ["User"]});
			navigate("/");
		},
		onError: (err=>setErrorState(err.code))
    });

	const onSubmit = (val: IFormFields)=>{
		submitMutation.mutate({
			Username: val.email,
			Password: val.password,
			RememberMe: val.rememberMe?"true":"false"
		});
	}

	const navigate = useNavigate();


	return (
		<Card sx={{maxWidth: 420, width: "100%",m: 2, p: {xs: 2, sm: 4}}}>
			<Stack alignItems="center" gap="0.5em">
				<img className={commonClasses.Logo} src="/logo.png" alt="Wheelu Logo" />
				<Typography variant="h5">Zaloguj się</Typography>

				<form className={commonClasses.Form} onSubmit={handleSubmit(onSubmit)}>
					<Alert className={resolveClasses([commonClasses.ErrorPanel, [commonClasses.Visible, errorState!=null] ])} severity="error">
						{
							errorState=="InvalidCredentials"?"Niepoprawny login lub hasło.":"Nie mogliśmy Cię teraz zalogować."
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

					<Controller
						name="password"
						control={control}
						rules={{required: true}}
						render={({field})=> 
							<TextField
								color="secondary"
								className={commonClasses.Input} 
								variant="filled" 
								label="Password"
								type="password" 
								autoComplete="current-password"
								required
								{...field}
							/>
						}
					/>
					
					<Controller
						name="rememberMe"
						control={control}
						render={({field})=> 
							<FormControlLabel 
								sx={{alignSelf: "flex-start", mb: 1}}
								control={<Checkbox {...field}/>} 
								label="Zapamiętaj mnie"
							/>
						}
					/>

					<Button type="submit" variant="contained" sx={{mb: 1}}>Zaloguj się</Button>
				</form>

				<Typography variant="body2">
					Nie masz jeszcze konta? <Link onClick={()=>navigate("/register")}>Zarejestruj się</Link>
				</Typography>
			</Stack>
		</Card>
	)
}
