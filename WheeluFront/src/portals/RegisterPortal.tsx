import { Button, TextField, Typography, Link, Card, Stack, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";

import commonClasses from "./Common.module.css";
import classes from "./RegisterPortal.module.css";
import { Controller, useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { callAPI, resolveClasses } from "../modules/utils";
import { API } from '../types/api';
import { useMemo, useState } from "react";


interface IFormFields {
	email: string
	name: string
	surname: string
	birthday: string
	password: string
	cpassword: string
}

export default function RegisterPortal() {

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<IFormFields>(
		{
			defaultValues: {
				email: "", name: "", surname: "",
				birthday: "", password: "", cpassword: ""
			}
		}
	)

	const [errorState, setErrorState] = useState<API.Auth.SignUp.IEndpoint["errCodes"] | null>(null);

	const navigate = useNavigate();

	const submitMutation = useMutation<null,API.Auth.SignUp.IEndpoint["error"], API.Auth.SignUp.IRequestData>({
        mutationFn: data=>callAPI<API.Auth.SignUp.IEndpoint>("POST","/api/v1/auth/signup",data, null, true),
        onSuccess: async ()=>{
			navigate("/login");
		},
		onError: (err=>{
			setErrorState(err.code);
		})
    });

	const errorMessage = useMemo(()=>{
		switch(errorState) {
			case "EmailAlreadyTaken": return "Ten email jest już zajęty.";
			case "PasswordRequirementsNotMet": return "Hasło nie spełnia wymagań.";
			default: return "Nie możemy teraz przetworzyć tego żądania."
		}
	},[errorState]);

	const onSubmit = (val: IFormFields)=>{
		submitMutation.mutate({
			Username: val.email,
			Name: val.name,
			Surname: val.surname,
			Password: val.password
		});
	}

	return (
		<Card className={classes.RegisterPanel} sx={{m: 2, p: {xs: 2, sm: 4}}}>
			<Stack alignItems="center" gap="0.5em">
				<img className={commonClasses.Logo} src="/logo.png" alt="Wheelu Logo" />
				<Typography variant="h5">Zarejestruj się</Typography>
				<form className={commonClasses.Form} onSubmit={handleSubmit(onSubmit)}>
					<Alert className={resolveClasses([commonClasses.ErrorPanel, [commonClasses.Visible, errorState!=null] ])} severity="error">
						{
							errorMessage
						}
					</Alert>
					<Stack className={commonClasses.InputContainer}>
						<Stack className={commonClasses.InputGroup}>
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
								name="name"
								control={control}
								rules={{required: true, minLength: 2}}
								render={({field})=>
									<TextField
										color="secondary"
										className={commonClasses.Input} 
										variant="filled" 
										label="Imię"
										type="text" 
										autoComplete="given-name"
										required
										autoCapitalize="words"
										{...field}
									/>
								}
							/>

							<Controller 
								name="surname"
								control={control}
								rules={{required: true, minLength: 2}}
								render={({field})=>
									<TextField 
										className={commonClasses.Input}
										color="secondary"
										variant="filled"
										label="Nazwisko"
										type="text" 
										autoComplete="family-name"
										required
										autoCapitalize="words"
										{...field}
									/>
								}
							/>
							
							<Controller 
								name="birthday"
								control={control}
								rules={{required: true}}
								render={({field})=>
									<TextField 
										className={commonClasses.Input}
										color="secondary"
										variant="filled" 
										InputLabelProps={{shrink: true}} 
										label="Data urodzenia" 
										type="date" 
										autoComplete="bday"
										required
										{...field}
									/>
								}
							/>
						</Stack>
						
						<Stack className={commonClasses.InputGroup}>
							<Controller 
								name="password"
								control={control}
								rules={{required: true, minLength: 6, pattern: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-_]).{6,}$/}}
								render={({field})=>
									<TextField 
										className={commonClasses.Input}
										color="secondary"
										variant="filled" 
										label="Hasło" 
										type="password" 
										autoComplete="new-password"
										required
										error={errors.password!=undefined}
										helperText={
											errors.password!=undefined?
											"Hasło musi mieć conajmniej 6 znaków, w tym 1 wielką, 1 małą literę, 1 cyfrę oraz znak specjalny."
											:
											undefined
										}
										{...field}
									/>
								}
							/>

							<Controller 
								name="cpassword"
								control={control}
								rules={{required: true, validate: (value, fields)=>fields.password==value}}
								render={({field})=>
									<TextField 
										className={commonClasses.Input}
										color="secondary"
										variant="filled" 
										label="Potwierdź hasło"
										type="password" 
										autoComplete="new-password"
										required
										error={errors.cpassword!=undefined}
										helperText={
											errors.cpassword!=undefined?
											"Hasło różni się od tego podanego wcześniej."
											:
											undefined
										}
										{...field}
									/>
								}
							/>
						</Stack>
					</Stack>
				
					<Button type="submit" variant="contained" sx={{mb: 1}}>Zarejestruj się</Button>
				</form>

				<Typography variant="body2">
					Masz już konto? <Link onClick={()=>navigate("/login")}>Przejdź do logowania</Link>
				</Typography>
			</Stack>
		</Card>
	)
}
