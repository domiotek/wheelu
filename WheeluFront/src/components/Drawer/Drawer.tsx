import { CSSObject, ThemeProvider } from "@emotion/react";
import { Box, Drawer as MuiDrawer, Collapse, List, ListItemButton, ListItemIcon, ListItemText, Theme, styled, useMediaQuery } from "@mui/material";
import { Link } from "react-router-dom";
import SchoolIcon from '@mui/icons-material/School';
import AccountPanel from "../AccountPanel/AccountPanel";
import { useContext, useState } from "react";
import { AppContext } from "../../App";
import { c } from "../../modules/utils";

import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import FolderIcon from '@mui/icons-material/Folder';
import ClassIcon from '@mui/icons-material/Class';

import classes from "./Drawer.module.css";

interface IProps {
	open: boolean
	setOpen: (state: boolean)=>void
}


const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
	width: drawerWidth,
	background: "#555555",
	color: "white",
	transition: theme.transitions.create('width', {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.enteringScreen,
	}),
	overflowX: 'hidden'
});

const closedMixin = (theme: Theme): CSSObject => ({
	transition: theme.transitions.create('width', {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen
	}),
	overflowX: 'hidden',
	background: "#555555",
	color: "white",
	width: 0,
	[theme.breakpoints.up('sm')]: {
		width: `calc(${theme.spacing(9)} + 1px)`,
	},
});

const StyledDrawer = styled(MuiDrawer)(
	({ theme, open }) => ({
		width: drawerWidth,
		flexShrink: 0,
		whiteSpace: 'nowrap',
		boxSizing: 'border-box',
		...(open && {
			...openedMixin(theme),
			'& .MuiDrawer-paper': openedMixin(theme),
		}),
		...(!open && {
			...closedMixin(theme),
			'& .MuiDrawer-paper': closedMixin(theme),
		}),
	}),
);


export default function Drawer({open, setOpen}: IProps) {
	const [offerSectionOpen, setOfferSectionOpen] = useState<boolean>(false);
	const [accountSectionOpen, setAccountSectionOpen] = useState<boolean>(false);

	const {darkTheme} = useContext(AppContext);

	const isDesktop = useMediaQuery(darkTheme.breakpoints.up("sm"));

	const handleDrawer = () => {
		if(open) {
			setOfferSectionOpen(false);
			setAccountSectionOpen(false);
		}
	  	setOpen(!open);
	};

	function handleSection(this: {value: boolean, setValue: typeof setOfferSectionOpen}) {
		if(!this.value) {
			setOpen(true);
		}

		this.setValue(!this.value);
	}

	const handleAccountMenu = (state: boolean)=>{
		if(state==true && !open) 
			setOpen(true);
		setAccountSectionOpen(state);
	}


	return (
		<ThemeProvider theme={darkTheme}>
				<StyledDrawer className={classes.Drawer} variant={isDesktop?"permanent":"temporary"} open={open} ModalProps={{keepMounted: true}} onClose={()=>setOpen(false)}>
					<Box className={classes.DrawerHeader}>
						<Link className={c([classes.HomeLink, classes.NavHomeLink, [classes.Visible, open]])} to={"/Dashboard"}>
							<img src="/logo.png" alt="Logo"/>
						</Link>
						<IconButton onClick={handleDrawer} sx={{mr: 1}}>
							<MenuIcon />
						</IconButton>
					</Box>

					<List>
						<ListItemButton onClick={handleSection.bind({value: offerSectionOpen, setValue: setOfferSectionOpen})}
							sx={{pl: 3}}
						>
							<ListItemIcon><FolderIcon /></ListItemIcon>
							<ListItemText>Oferta</ListItemText>

						</ListItemButton>
						<Collapse in={offerSectionOpen} timeout="auto" unmountOnExit>
							<List component="div" disablePadding>
								<ListItemButton sx={{ pl: 4 }}>
									<ListItemIcon><ClassIcon /></ListItemIcon>
									<ListItemText>
										Kursy
									</ListItemText>
								</ListItemButton>
								<ListItemButton sx={{ pl: 4 }}>
									<ListItemIcon><SchoolIcon /></ListItemIcon>
									<ListItemText>
										Szkoły jazdy
									</ListItemText>
								</ListItemButton>
							</List>
						</Collapse>
					</List>
					<Box sx={{mt: "auto"}}>
						<AccountPanel open={accountSectionOpen} setOpen={handleAccountMenu}/>
					</Box>
				</StyledDrawer>
			</ThemeProvider>
	)
}