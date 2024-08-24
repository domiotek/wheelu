import { FormContainer, SelectElement, TextFieldElement, useForm } from "react-hook-form-mui"
import { c, prepareFieldErrorMessage } from "../../../../modules/utils"
import { Autocomplete, Button, IconButton, MenuItem, TextField, Typography } from "@mui/material"
import { useCallback, useEffect, useRef, useState } from "react";
import { API } from "../../../../types/api";
import { App } from "../../../../types/app";
import classes from "./ResolveApplicationForm.module.css";
import { Close } from "@mui/icons-material";

interface IProps {
	data: App.Models.IApplication
	cities: App.Models.ICity[]
	states: App.Models.IState[]

	onUpdate: (data: App.Models.IApplication, nearbyCities: App.Models.ICityMatching[])=>void
	onChange: (safeToCommit: boolean)=>void
}

export default function ResolveApplicationForm({data, cities, states, onUpdate, onChange}: IProps) {
	const [nearbyCitiesList, setNearbyCitiesList] = useState<Partial<App.Models.ICityMatching>[]>([]);

	const formContext = useForm<API.Application.PostNew.IRequestData>();

	const submitRef = useRef<HTMLButtonElement | null>(null);
	const values = formContext.watch();

	const nearbyCitiesSectionRef = useRef<HTMLDivElement | null>(null);

	const submitCallback = useCallback((data: App.Models.IApplication)=>{

		for (const city of nearbyCitiesList) {
			if(city.cityName==""||city.state==undefined) {

				if(nearbyCitiesSectionRef.current) {
					const input = nearbyCitiesSectionRef.current.querySelector(".Mui-error input") as HTMLInputElement | null;
					input?.scrollTo({behavior: "smooth"});
					input?.focus();
				}

				return onChange(false);

			}
		}
		
		onChange(true);
		onUpdate(data, nearbyCitiesList as App.Models.ICityMatching[]);
	},[nearbyCitiesList]);

	const addNewCityCallback = useCallback(()=>{
		if(nearbyCitiesList.find((val)=>Object.keys(val).length==1&&val.cityName=="")) return;

		const array = Array.from(nearbyCitiesList);
		array.push({cityName: ""});

		setNearbyCitiesList(array);
	},[nearbyCitiesList]);

	const modifyCityCallback = useCallback((record: Partial<App.Models.ICityMatching>, type: "city" | "state" | "remove"="remove", value?: string)=>{
		const index = nearbyCitiesList.indexOf(record);
		if(index==-1) return;

		const array = Array.from(nearbyCitiesList);

		if(type!="remove") {

			const updated: typeof record = {
				identifier: record.identifier,
				cityName: type=="city"?value:record.cityName,
				state: type=="state"?value:record.state
			}

			array.splice(index, 1, updated);
		}else array.splice(index, 1);

		setNearbyCitiesList(array);
		submitCallback(values);
	},[nearbyCitiesList]);

	useEffect(()=>{
		const formProps = Object.keys(formContext.getValues());

		for (const prop in data) {
			const value = (data as any as Record<string,string>)[prop];

			if(formProps.includes(prop))
				formContext.setValue(prop, value);
		}

	},[data, cities, states]);

	useEffect(()=>{
		if(!data || !cities) return;

		const result: Partial<App.Models.ICityMatching>[] = [];

		for (const city of data.nearbyCities) {
			const existingCity = cities.find(val=>val.name==city);

			result.push(
				existingCity?
				{identifier: existingCity.id, cityName: city, state: existingCity.state.name}
				:
				{cityName: city}
			)
		}

		setNearbyCitiesList(result);
	},[data, cities]);

	useEffect(()=>submitRef.current?.click(),[values]);

	return (
		<FormContainer FormProps={{className: classes.Form}} formContext={formContext} onSuccess={submitCallback}>
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
					helperText={
						cities?.find(opt=>{
							const currValue = formContext.getValues();
							return (
								currValue.city==""||
								currValue["city"]==opt.name&&
								currValue["state"]==opt.state.name
							);
						})?"":"Miasto zostanie dodane"
					}
				/>

				<div className={classes.InputGroup}>
					<SelectElement
						name="state"
						required
						color="secondary"
						variant="filled"
						label="Województwo"
						options={states}
						valueKey="name"
						labelKey="name"
						parseError={prepareFieldErrorMessage}
					/>
				</div>
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

			<div className={classes.SectionHeader}>
				<h4>Miasta w pobliżu</h4>
				<Button size="small" className={classes.AddCityButton} onClick={addNewCityCallback}>
					Dodaj
				</Button>
			</div>


			<div ref={nearbyCitiesSectionRef} className={classes.NearbyCitiesSection}>
				{
					nearbyCitiesList.length==0 &&
					<div>
						<Typography textAlign="center">Brak danych</Typography>
					</div>
				}

				{
					nearbyCitiesList.map(city=>{
						return (
						<div key={`${city.cityName}-${city.state}`} className={classes.NearbyCityWrapper}>
							<Autocomplete
								freeSolo={true}
								size="small"
								options={cities.length>0?Array.from(new Set([cities.map(opt=>opt.name)]).values()):[]}
								color="secondary"
								value={city.cityName}
								onChange={(_ev, value)=>modifyCityCallback(city, "city", value as string)}
								autoSelect={true}
								renderInput={(props)=><TextField 
									color="secondary"
									variant="filled"
									label="Miasto"
									value={city.cityName}
									error={city.cityName==""}
									required
									helperText={
										city.cityName==""||
										city.state==undefined?
										"Uzupełnij pola. (Zatwierdź miasto enterem)"
										:
											cities?.find(opt=>city.cityName==opt.name&&city.state==opt.state.name)?
												"Istniejące miaso zostanie użyte."
											:
												"Miasto zostanie dodane."
									}
									{...props}
								/>}
							/>
							<TextField
								select
								size="small"
								color="secondary"
								variant="filled"
								label="Województwo"
								required
								onChange={(ev)=>modifyCityCallback(city, "state", ev.target.value as string)}
								value={city.state ?? ""}
								error={city.state==undefined}
							>
								{
									states?.map(state=>
										<MenuItem key={state.id} value={state.name}>{state.name}</MenuItem>
									)
								}
							</TextField>

							<Button className={c([classes.RemoveCityButton, classes.MobileButton])} onClick={()=>modifyCityCallback(city)}>Usuń</Button>
							<IconButton className={c([classes.RemoveCityButton, classes.DesktopButton])} onClick={()=>modifyCityCallback(city)}><Close/></IconButton>
							
						</div>)
					})
				}
			</div>
			<button ref={submitRef} type="submit" hidden></button>
		</FormContainer>
	)
}
