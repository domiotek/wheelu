import { CSSObject, ThemeProvider } from "@emotion/react";
import {
	Box,
	Drawer as MuiDrawer,
	Collapse,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Theme,
	styled,
	useMediaQuery,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import SchoolIcon from "@mui/icons-material/School";
import AccountPanel from "../AccountPanel/AccountPanel";
import { useContext, useMemo, useState } from "react";
import { AppContext } from "../../App";
import { c } from "../../modules/utils";

import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import FolderIcon from "@mui/icons-material/Folder";
import ClassIcon from "@mui/icons-material/Class";

import classes from "./Drawer.module.css";
import { Business, CalendarMonth, Security } from "@mui/icons-material";
import { AccessLevel } from "../../modules/enums";
import ScheduleModal from "../../modals/ScheduleModal/ScheduleModal";

interface IProps {
	open: boolean;
	setOpen: (state: boolean) => void;
}

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
	width: drawerWidth,
	background: "#555555",
	color: "white",
	transition: theme.transitions.create("width", {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.enteringScreen,
	}),
	overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
	transition: theme.transitions.create("width", {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	overflowX: "hidden",
	background: "#555555",
	color: "white",
	width: 0,
	[theme.breakpoints.up("sm")]: {
		width: `calc(${theme.spacing(9)} + 1px)`,
	},
});

const StyledDrawer = styled(MuiDrawer)(({ theme, open }) => ({
	width: drawerWidth,
	flexShrink: 0,
	whiteSpace: "nowrap",
	boxSizing: "border-box",
	...(open && {
		...openedMixin(theme),
		"& .MuiDrawer-paper": openedMixin(theme),
	}),
	...(!open && {
		...closedMixin(theme),
		"& .MuiDrawer-paper": closedMixin(theme),
	}),
}));

export default function Drawer({ open, setOpen }: IProps) {
	const [offerSectionOpen, setOfferSectionOpen] = useState<boolean>(false);
	const [accountSectionOpen, setAccountSectionOpen] =
		useState<boolean>(false);

	const { darkTheme, accessLevel, userDetails, setModalContent } =
		useContext(AppContext);

	const isDesktop = useMediaQuery(darkTheme.breakpoints.up("sm"));

	const navigate = useNavigate();

	const handleDrawer = () => {
		if (open) {
			setOfferSectionOpen(false);
			setAccountSectionOpen(false);
		}
		setOpen(!open);
	};

	function handleSection(this: {
		value: boolean;
		setValue: typeof setOfferSectionOpen;
	}) {
		if (!this.value) {
			setOpen(true);
		}

		this.setValue(!this.value);
	}

	const handleAccountMenu = (state: boolean) => {
		if (state == true && !open) setOpen(true);
		setAccountSectionOpen(state);
	};

	const dynamicNavOptions = useMemo(() => {
		const result: App.UI.Navigation.INavOptionDef[] = [];

		switch (accessLevel) {
			case AccessLevel.Administrator:
				result.push({
					icon: <Security />,
					name: "Admin Panel",
					link: "/panel",
				});
				break;
			case AccessLevel.SchoolOwner:
				result.push({
					icon: <Business />,
					name: "Moja szkoła",
					link: `/schools/${userDetails?.ownedSchool?.id}/manage`,
				});
				break;

			case AccessLevel.Instructor:
				result.push({
					icon: <CalendarMonth />,
					name: "Mój grafik",
					link: ``,
					action: () =>
						setModalContent(
							<ScheduleModal
								instructorID={
									userDetails?.instructorProfile?.id!
								}
								allowAlter={true}
							/>
						),
				});
				break;
		}

		return result;
	}, [accessLevel]);

	return (
		<ThemeProvider theme={darkTheme}>
			<StyledDrawer
				variant={isDesktop ? "permanent" : "temporary"}
				open={open}
				ModalProps={{ keepMounted: true }}
				onClose={() => setOpen(false)}
			>
				<Box className={classes.DrawerHeader}>
					<Link
						className={c([
							classes.HomeLink,
							classes.NavHomeLink,
							[classes.Visible, open],
						])}
						to={"/home"}
					>
						<img src="/logo.png" alt="Logo" />
					</Link>
					<IconButton onClick={handleDrawer} sx={{ mr: 1 }}>
						<MenuIcon />
					</IconButton>
				</Box>

				<List>
					<ListItemButton
						onClick={handleSection.bind({
							value: offerSectionOpen,
							setValue: setOfferSectionOpen,
						})}
						sx={{ pl: 3 }}
					>
						<ListItemIcon>
							<FolderIcon />
						</ListItemIcon>
						<ListItemText>Oferta</ListItemText>
					</ListItemButton>
					<Collapse
						in={offerSectionOpen}
						timeout="auto"
						unmountOnExit
					>
						<List component="div" disablePadding>
							<ListItemButton
								sx={{ pl: 4 }}
								onClick={() => navigate("/courses")}
							>
								<ListItemIcon>
									<ClassIcon />
								</ListItemIcon>
								<ListItemText>Kursy</ListItemText>
							</ListItemButton>
							<ListItemButton
								sx={{ pl: 4 }}
								onClick={() => navigate("/schools")}
							>
								<ListItemIcon>
									<SchoolIcon />
								</ListItemIcon>
								<ListItemText>Szkoły jazdy</ListItemText>
							</ListItemButton>
						</List>
					</Collapse>
					{dynamicNavOptions.map((opt) => (
						<ListItemButton
							key={opt.name}
							sx={{ pl: 3 }}
							onClick={() => {
								opt.action && opt.action();
								opt.link && navigate(opt.link);
							}}
						>
							<ListItemIcon>{opt.icon}</ListItemIcon>
							<ListItemText>{opt.name}</ListItemText>
						</ListItemButton>
					))}
				</List>
				<Box sx={{ mt: "auto" }}>
					<AccountPanel
						open={accountSectionOpen}
						setOpen={handleAccountMenu}
					/>
				</Box>
			</StyledDrawer>
		</ThemeProvider>
	);
}
