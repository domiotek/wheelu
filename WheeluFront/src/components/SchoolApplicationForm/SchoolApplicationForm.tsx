import { Alert, Autocomplete, Button, Chip, createFilterOptions, Snackbar, TextField } from "@mui/material";

import classes from "./SchoolApplicationForm.module.css";
import { c, callAPI, prepareFieldErrorMessage } from "../../modules/utils";
import { useCallback, useState} from "react";
import { Controller, FormContainer, TextFieldElement, useForm } from "react-hook-form-mui";
import { API } from "../../types/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import SchoolApplicationService from "../../services/SchoolApplication";

const filter = createFilterOptions<string>();

interface IProps {
	onSuccess: ()=>void
}

export default function SchoolApplicationForm({onSuccess}: IProps) {
	const [citySelectOpened, setCitySelectOpened] = useState(false);
	const [snackBarOpened, setSnackBarOpened] = useState(false);
	const [submitError, setSubmitError] = useState<API.Application.PostNew.IEndpoint["errCodes"] | null>(null);
	const [nearbyCitiesList, setNearbyCitiesList] = useState<string[]>([]);
	const formContext = useForm<API.Application.PostNew.IRequestData>();

	const {data: cityOptions, isFetching: fetchingOptions} = useQuery<API.City.GetAll.IResponse, API.City.GetAll.IEndpoint["error"]>({
        queryKey: ["Cities"],
        queryFn: ()=>callAPI<API.City.GetAll.IEndpoint>("GET","/api/v1/cities"),
        retry: true,
		staleTime: 60000,
		enabled: citySelectOpened
    });

	const submitMutation = useMutation<null, API.Application.PostNew.IEndpoint["error"], API.Application.PostNew.IRequestData>({
        mutationFn: data=>callAPI<API.Application.PostNew.IEndpoint>("POST","/api/v1/applications",data, null, true),
        onSuccess: async ()=>onSuccess(),
		onError: (err=>{
			setSnackBarOpened(true);
			setSubmitError(err.code);
		})
    });

	const onSubmit = useCallback((value: API.Application.PostNew.IRequestData)=>{
		value = Object.assign(value,{nearbyCities: nearbyCitiesList});
		setSnackBarOpened(false);
		submitMutation.mutate(value);
	},[nearbyCitiesList]);

	return ( 
		<FormContainer FormProps={{className: classes.RegisterSchoolForm}} onSuccess={onSubmit} formContext={formContext}>
			<h2>Zarejestruj swoją szkołę jazdy</h2>
			<h5>Dołącz do nas i uprość życie sobie, Twoim pracownikom oraz kursantom.</h5>
			<h5>To proste.</h5>

			<h4>Podstawowe informacje</h4>
			<div className={classes.InputGroup}>
				<TextFieldElement 
					name="schoolName"
					color="secondary"
					rules={{maxLength: 50}}
					variant="filled"
					label="Nazwa"
					type="text"
					required
					parseError={prepareFieldErrorMessage}
				/>

				<TextFieldElement 
					name="nip"
					color="secondary"
					rules={{pattern: /^\d{10}$/}}
					variant="filled"
					label="NIP"
					type="text"
					required
					inputProps={{maxLength: 10}}
					parseError={(err)=>prepareFieldErrorMessage(err, {pattern: "Niewłaściwy format NIP."})}
				/>
			</div>

			<div className={classes.InputGroup}>

				<TextFieldElement 
					name="ownerName"
					rules={{minLength: 2, maxLength: 35}}
					color="secondary"
					variant="filled"
					label="Imię właściciela"
					autoCapitalize="words"
					autoComplete="given-name"
					required
					parseError={(err)=>prepareFieldErrorMessage(err, {minLength: "2 znaki", maxLength: "35 znaków"})}
				/>

				<TextFieldElement 
					name="ownerSurname"
					rules={{minLength: 2, maxLength: 50}}
					color="secondary"
					variant="filled"
					label="Nazwisko właściciela"
					autoCapitalize="words"
					autoComplete="given-name"
					required
					parseError={(err)=>prepareFieldErrorMessage(err, {minLength: "2 znaki", maxLength: "50 znaków"})}
				/>
			</div>

			<div className={classes.InputGroup}>
				<TextFieldElement 
					name="establishedDate"
					color="secondary"
					variant="filled"
					label="Data założenia"
					type="date"
					InputLabelProps={{shrink: true}} 
					required
					parseError={prepareFieldErrorMessage}
				/>
				<div />
			</div>

			<h4>Adres szkoły</h4>

			<div className={c([classes.InputGroup, classes.AddressInputGroup])}>

				<TextFieldElement 
					name="street"
					rules={{minLength: 2, maxLength: 75}}
					color="secondary"
					variant="filled"
					label="Ulica"
					required
					parseError={(err)=>prepareFieldErrorMessage(err, {minLength: "2 znaki", maxLength: "75 znaków"})}
				/>
				
				<TextFieldElement 
					name="buildingNumber"
					color="secondary"
					rules={{maxLength: 10}}
					variant="filled"
					label="Numer budynku"
					required
					parseError={err=>prepareFieldErrorMessage(err, {maxLength: "10 znaków"})}
				/>

				<TextFieldElement 
					name="subBuildingNumber"
					rules={{min: 1}}
					color="secondary"
					variant="filled"
					label="Numer lokalu"
					type="number"
					parseError={(err)=>prepareFieldErrorMessage(err, {min: 1})}
				/>

			</div>
			<div className={classes.InputGroup}>

				<TextFieldElement 
					name="zipCode"
					rules={{minLength: 6, maxLength: 6, pattern: /\d{2}-\d{3}/}}
					color="secondary"
					variant="filled"
					label="Kod pocztowy"
					required
					parseError={(err)=>prepareFieldErrorMessage(err, {pattern: "Niewłaściwy format kodu pocztowego."})}
				/>

				<TextFieldElement 
					name="city"
					rules={{minLength: 2, maxLength: 50}}
					color="secondary"
					variant="filled"
					label="Miasto"
					required
					parseError={(err)=>prepareFieldErrorMessage(err, {minLength: "2 znaki", maxLength: "50 znaków"})}
				/>
			</div>

			<h5>Dodaj miasta w poblizu, aby kursanci mogli łatwiej Cię znaleźć</h5>
			<Controller
				name="nearbyCities"
				control={formContext.control}
				render={()=>
					<Autocomplete
						className = {classes.SearchCityInput}
						value={nearbyCitiesList}
						onOpen={()=>setCitySelectOpened(true)}
						loading={fetchingOptions}
						onChange={(_ev, newValue) => {
							let result = [];

							for (const value of newValue) {
								if(typeof value=="string") result.push(value);
								else result.push((value as any).value);
							}

							setNearbyCitiesList(result);
						}}
						multiple
						options={cityOptions?.map(opt=>opt.name) ?? []}
						freeSolo
						renderTags={(value: string[], getTagProps) =>
							value.map((option: string, index: number) => {
								const props = getTagProps({ index });

								return <Chip
									variant="outlined"
									label={option}
									{...props}
									key={props.key}
								/>
							})
						}
						filterOptions = {(options, params) => {
							const filtered = filter(options, params);
					
							const { inputValue } = params;

							const isExisting = options.some((option) => inputValue === option);
							if (inputValue !== '' && !isExisting) {
								filtered.push({label: `Dodaj "${inputValue}"`, value: inputValue} as any);
							}
					
							return filtered;
						}}
						renderInput={(params) => (
							<TextField
								{...params}
								name=""
								color="secondary"
								variant="filled"
								label="Miasta w pobliżu"
								placeholder="Wybierz lub wpisz miasto"
							/>
						)}
					/>
				}
			/>
			

			<h4>Informacje kontaktowe</h4>
			<h5>Administrator użyje podanych informacji do kontaktu w celu weryfikacji poprawności podanych danych. Podany adres email posłuży Ci w przyszłości do logowania do serwisu.</h5>

			<div className={c([classes.InputGroup, classes.ContactInputs])}>
				<TextFieldElement 
					name="email"
					type="email"
					color="secondary"
					rules={{maxLength: 125}}
					variant="filled"
					label="Adres email"
					required
					parseError={(err)=>prepareFieldErrorMessage(err, {pattern: "Niewłaściwy adres email.", maxLength: "125 znaków"})}
				/>

				<TextFieldElement 
					name="phoneNumber"
					rules={{minLength: 9, maxLength: 16, pattern: /(?<!\w)(\(?(\+|00)?48\)?)?[ -]?\d{3}[ -]?\d{3}[ -]?\d{3}(?!\w)/}}
					color="secondary"
					variant="filled"
					label="Numer telefonu"
					autoComplete="tel"
					required
					parseError={(err)=>prepareFieldErrorMessage(err, {pattern: "Niewłaściwy format numeru telefonu.", maxLength: "16 znaków"})}
				/>
			</div>
			
			<Button className={classes.SubmitButton} variant="contained" type="submit" disabled={submitMutation.isPending}>Wyślij</Button>
			
			<Snackbar open={snackBarOpened} autoHideDuration={4000} anchorOrigin={{vertical: "bottom", horizontal: "right"}} onClose={()=>setSnackBarOpened(false)}>
				<Alert
					severity="error"
					variant="filled"
					sx={{ width: '100%' }}
				>
					Nie mogliśmy zarejestrować Twojego wniosku. {SchoolApplicationService.translateErrorCode(submitError ?? "InternalError")}
				</Alert>
			</Snackbar>
		</FormContainer>
	)
}
