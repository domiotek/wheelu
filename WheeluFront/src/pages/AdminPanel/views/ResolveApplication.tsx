import { useMutation, useQuery } from "@tanstack/react-query";
import { API } from "../../../types/api";
import { c, callAPI, prepareFieldErrorMessage } from "../../../modules/utils";
import { Controller, useForm } from "react-hook-form";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AutocompleteElement, FormContainer, SelectElement, TextFieldElement } from "react-hook-form-mui";
import { Alert, Autocomplete, Button, Chip, createFilterOptions, Fab, IconButton, Paper, Snackbar, SwipeableDrawer, TextField, useMediaQuery } from "@mui/material";
import SchoolApplicationService from "../../../services/SchoolApplication";

import classes from "./ResolveApplication.module.css";
import { AppContext } from "../../../App";
import { CheckOutlined, Close } from "@mui/icons-material";
import ApplicationSummary, { IApplicationSummaryProps } from "../components/ApplicationSummary/ApplicationSummary";


const filter = createFilterOptions<string>();

export default function ResolveApplication() {
	const [drawerOpen, setDrawerOpen] = useState(false);


	const [citySelectOpened, setCitySelectOpened] = useState(false);
	const [snackBarOpened, setSnackBarOpened] = useState(false);
	const [submitError, setSubmitError] = useState<API.Application.PostNew.IEndpoint["errCodes"] | null>(null);
	const [nearbyCitiesList, setNearbyCitiesList] = useState<string[]>([]);
	const formContext = useForm<API.Application.PostNew.IRequestData>();

	const {darkTheme} = useContext(AppContext);

	const isDesktop = useMediaQuery(darkTheme.breakpoints.up("md"));

	const {data: cityOptions, isFetching: fetchingOptions} = useQuery<API.City.GetAll.IResponse, API.City.GetAll.IEndpoint["error"]>({
        queryKey: ["Cities"],
        queryFn: ()=>callAPI<API.City.GetAll.IEndpoint>("GET","/api/v1/cities"),
        retry: true,
		staleTime: 60000,
		enabled: citySelectOpened
    });

	const {data: stateOptions} = useQuery<API.State.GetAll.IResponse, API.State.GetAll.IEndpoint["error"]>({
        queryKey: ["States"],
        queryFn: ()=>callAPI<API.State.GetAll.IEndpoint>("GET","/api/v1/states"),
        retry: true,
		staleTime: Infinity
    });

	const submitMutation = useMutation<null, API.Application.PostNew.IEndpoint["error"], API.Application.PostNew.IRequestData>({
        mutationFn: data=>callAPI<API.Application.PostNew.IEndpoint>("POST","/api/v1/applications",data, null, true),
        onSuccess: async ()=>{},
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

	useEffect(()=>setDrawerOpen(false), [isDesktop]);

	const summaryProps: IApplicationSummaryProps = useMemo(()=>{
		return {
			schoolName: "Some School",
			ownerFullName: "Some guy",
			phoneNumber:"666424265",
			email: "test@com.email",
			onConfirm: (outcome)=>{

			}
		}
	},[]);

	return (
		<section className={classes.ContentWrapper}>
			<FormContainer FormProps={{className: classes.Form}} onSuccess={onSubmit} formContext={formContext}>

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
						name="ownerBirthday"
						color="secondary"
						variant="filled"
						label="Data urodzenia właściciela"
						type="date"
						InputLabelProps={{shrink: true}} 
						required
						parseError={prepareFieldErrorMessage}
					/>
					
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
				</div>

				<h4>Adres szkoły</h4>

				<div className={c([classes.InputGroup])}>

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

					<div className={classes.InputGroup}>
						<SelectElement
							name="state"
							required
							color="secondary"
							variant="filled"
							label="Województwo"
							options={stateOptions}
							valueKey="name"
							labelKey="name"
							parseError={prepareFieldErrorMessage}
						/>
					</div>
				</div>

				<div className={classes.SectionHeader}>
					<h4>Miasta w pobliżu</h4>
					<Button size="small" className={classes.AddCityButton}>Dodaj</Button>
				</div>


				<div className={classes.NearbyCitiesSection}>
					

					{
						[0,1,2,3,4,5,6].map(()=>{
							return (
							<div className={classes.NearbyCityWrapper}>
								<AutocompleteElement
									name="test"
									options={cityOptions?.map(opt=>opt.name) ?? []}
									autocompleteProps={{freeSolo: true, size:"small"}}
									textFieldProps={
										{
											color: "secondary",
											variant: "filled"
										}
									}
									label = "Miasto"
									required
								/>
								<SelectElement
									name="state"
									required
									size="small"
									color="secondary"
									variant="filled"
									label="Województwo"
									options={stateOptions}
									valueKey="name"
									labelKey="name"
									parseError={prepareFieldErrorMessage}
								/>
								<Button className={c([classes.RemoveCityButton, classes.MobileButton])}>Usuń</Button>
								<IconButton className={c([classes.RemoveCityButton, classes.DesktopButton])}><Close/></IconButton>
								
							</div>)
						})
					}
				</div>

				<h4>Informacje kontaktowe</h4>

				<div className={c([classes.InputGroup])}>
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


			<div className={classes.Aside}>
				<Paper>
					<ApplicationSummary {...summaryProps} />
				</Paper>
			</div>


			<SwipeableDrawer 
				variant="temporary"
				classes={{ paper: classes.Drawer }}
				ModalProps={{keepMounted: true}} 
				onClose={()=>setDrawerOpen(false)} 
				onOpen={()=>{}} 
				open={drawerOpen&&!isDesktop}
				anchor="bottom"
				disableSwipeToOpen={true}
			>
				<span className={classes.Handle}></span>
				<ApplicationSummary {...summaryProps} />
			</SwipeableDrawer>

			<Fab className={classes.OpenDrawerButton} color="secondary" onClick={()=>setDrawerOpen(true)}>
				<CheckOutlined />
			</Fab>
		</section>
	)
}
