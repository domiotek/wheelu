import { Box, Button, Card, Chip, Container, Divider, Grid, List, ListItem, ListItemText, Popover, Stack, Typography } from "@mui/material";
import classes from "./LandingPage.module.css";
import { MouseEvent, useCallback, useState } from "react";

export default function LandingPage() {

	const [popoverTarget, setPopoverTarget] = useState<HTMLDivElement | null>(null);
	const [popoverOpen, setPopoverOpen] = useState<boolean>(false);
	const [openCategory, setOpenCategory] = useState<keyof typeof categoryPermissions | null>(null);

	const openPopoverHandler = useCallback(function (this: keyof typeof categoryPermissions, e: MouseEvent<HTMLElement>) {
		e.stopPropagation();

		const card = (e.target as HTMLElement).closest("div");

		if(card) {
			setPopoverOpen(true);
			setPopoverTarget(card);
			setOpenCategory(this);
		}
	},[]);

	const categoryPermissions = {
		"AM": ["motorower", "mały czterokołowiec"],
		"A1": ["pojazdy z AM", "mały motocykl", "motocykl trójkołowy"],
		"A2": ["średni motocykl", "pojazdy z A1"],
		"A": ["każdy motocykl", "pojazdy z AM"],
		"B": ["samochód osobowy do 3,5t", "samochód z lekką przyczepą", "pojazdy z AM", "ciągnik rolniczy"],
		"C": ["pojazd ponad 3,5 t (z wyjątkiem autobusu)", "ciężarówka z lekką przyczepą", "pojazdy z AM", "ciągnik rolniczy"],
		"C1": ["pojazd o masie od 3,5 t do 7,5 t", "ciężarówka z przyczepą", "pojazd z AM", "ciągnik rolniczy"],
		"D": ["autobus", "autobus z małą przyczepką", "pojazdy z AM", "ciągnik rolniczy"],
		"D1": ["mały autobus", "autobus z małą przyczepką", "pojazdy z AM", "ciągnik rolniczy"],
		"T": ["ciągnik rolniczy", "pojazdy z AM"]
	}

	return (
		<>
			<Container className={classes.TitleSection}>
				<Typography variant="h2">Wheelu</Typography>
				<Divider className={classes.Underline} sx={{borderColor: theme=>theme.palette.primary .light}}/>
				<Typography variant="subtitle1">Szukanie szkoły jazdy właśnie stało się znacznie prostsze.</Typography>
			</Container>
			<Stack className={classes.CategoriesSection} sx={{background: theme=>theme.palette.secondary.light}}>
				<Container>
					<Typography variant="subtitle1" color={theme=>theme.palette.secondary.contrastText}>Kategorie prawa jazdy</Typography>
					<Grid className={classes.CardGridWrapper} container>
						{
							([
								{name: "AM", icon: "fa-motorcycle"},
								{name: "A", icon: "fa-motorcycle"},
								{name: "B", icon: "fa-car-side"},
								{name: "C", icon: "fa-truck"},
								{name: "D", icon: "fa-bus"},
								{name: "T", icon: "fa-tractor"},
								{name: "A1", icon: "fa-motorcycle"},
								{name: "A2", icon: "fa-motorcycle"},
								{name: "C1", icon: "fa-truck"},
								{name: "D1", icon: "fa-bus"},
							] as const).map(elem=>
									<Card key={elem.name} onClick={openPopoverHandler.bind(elem.name)} >
										<Button sx={{color: theme=>theme.palette.text.secondary}}>
											<i className={`fas ${elem.icon}`}/>
											<span>{elem.name}</span>
										</Button>
										
									</Card>
								
							)
						}
					</Grid>
					<Popover
					 	anchorEl={popoverTarget} 
						open={popoverOpen} 
						onClose={()=>setPopoverOpen(false)} 
						anchorOrigin={{
							vertical: 'center',
							horizontal: 'center',
						}}
						transformOrigin={{
							vertical: 'center',
							horizontal: 'center',
						}}
					>
						<Box className={classes.CategoryInfoPanel}>
							<Stack direction="row" alignItems="center" gap={1}>
								<Chip label={openCategory} variant="outlined" color="primary"/>
								<Typography variant="body2">Pozwala prowadzić</Typography>
							</Stack>
							<Divider />
							<List>
								{
									openCategory && 
										categoryPermissions[openCategory].map(item=>
											<ListItem key={item}>
												<ListItemText>{item}</ListItemText>
											</ListItem>
										)
								}
							</List>
							<Typography variant="caption" alignSelf="flex-end">
								<Button href="https://www.gov.pl/web/gov/kategorie-prawa-jazdy" target="__blank">
									Zobacz szczegóły
								</Button>
							</Typography>
						</Box>
					</Popover>
				</Container>
			</Stack>
		</>
		
	)
}
