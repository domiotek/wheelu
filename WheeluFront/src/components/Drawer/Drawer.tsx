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
import { useCallback, useContext, useMemo, useState } from "react";
import { AppContext } from "../../App";
import { c, callAPI } from "../../modules/utils";

import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import FolderIcon from "@mui/icons-material/Folder";
import ClassIcon from "@mui/icons-material/Class";

import classes from "./Drawer.module.css";
import { Business, CalendarMonth, Security } from "@mui/icons-material";
import { AccessLevel } from "../../modules/enums";
import InstructorScheduleModal from "../../modals/ScheduleModal/InstructorScheduleModal";
import { useQuery } from "@tanstack/react-query";
import { API } from "../../types/api";
import AuthService from "../../services/Auth";
import { CourseCategoryFormatter } from "../../modules/formatters";
import StudentScheduleModal from "../../modals/ScheduleModal/StudentScheduleModal";

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
	const [coursesSectionOpen, setCoursesSectionOpen] =
		useState<boolean>(false);
	const [accountSectionOpen, setAccountSectionOpen] =
		useState<boolean>(false);

	const { darkTheme, accessLevel, userDetails, setModalContent } =
		useContext(AppContext);

	const isDesktop = useMediaQuery(darkTheme.breakpoints.up("sm"));

	const navigate = useNavigate();

	const { data: userActiveCourses } = useQuery<
		API.Courses.GetManyOfUser.IResponse,
		API.Courses.GetManyOfUser.IEndpoint["error"]
	>({
		queryKey: ["User", "#", userDetails?.userId, "Courses"],
		queryFn: () =>
			callAPI<API.Courses.GetManyOfUser.IEndpoint>(
				"GET",
				"/api/v1/users/:userID/courses",
				null,
				{
					userID: userDetails!.userId,
				}
			),
		retry: true,
		staleTime: 60000,
		enabled: userDetails != undefined,
	});

	const handleDrawer = () => {
		if (open) {
			setOfferSectionOpen(false);
			setCoursesSectionOpen(false);
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

	const handleAccountMenu = useCallback((state: boolean) => {
		if (state) setOpen(true);
		setAccountSectionOpen(state);
	}, []);

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
							<InstructorScheduleModal
								instructorID={
									userDetails?.instructorProfile?.id!
								}
								allowAlter={true}
							/>
						),
				});
				if (userDetails?.instructorProfile?.activeEmployment)
					result.push({
						icon: <Business />,
						name: "Szkoła jazdy",
						link: `/schools/${userDetails.instructorProfile.activeEmployment.schoolId}/manage`,
					});
				break;
			case AccessLevel.Student:
				result.push({
					icon: <CalendarMonth />,
					name: "Moje jazdy",
					link: ``,
					action: () =>
						setModalContent(
							<StudentScheduleModal
								studentID={userDetails?.userId!}
							/>
						),
				});
				break;
		}

		return result;
	}, [accessLevel, userDetails]);

	const userCoursesSection = useMemo(() => {
		if (
			userDetails?.role == "Administrator" ||
			userDetails?.role == "SchoolManager"
		)
			return <></>;

		return (
			<>
				<ListItemButton
					onClick={handleSection.bind({
						value: coursesSectionOpen,
						setValue: setCoursesSectionOpen,
					})}
					sx={{ pl: 3 }}
				>
					<ListItemIcon>
						<SchoolIcon />
					</ListItemIcon>
					<ListItemText>Moje kursy</ListItemText>
				</ListItemButton>
				<Collapse in={coursesSectionOpen} timeout="auto" unmountOnExit>
					<List component="div" disablePadding>
						{userActiveCourses?.map((c) => (
							<ListItemButton
								key={c.id}
								sx={{ pl: 4 }}
								onClick={() => navigate(`/courses/${c.id}`)}
							>
								<ListItemIcon className={classes.CourseIcon}>
									{CourseCategoryFormatter.format(c.category)}
								</ListItemIcon>
								<ListItemText>
									{userDetails?.role == "Instructor"
										? AuthService.getUserFullName(c.student)
										: c.schoolName}
								</ListItemText>
							</ListItemButton>
						))}
					</List>
				</Collapse>
			</>
		);
	}, [userDetails, userActiveCourses, coursesSectionOpen]);

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
					{userCoursesSection}
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
