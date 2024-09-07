import { useTheme } from "@emotion/react";
import { Box, Theme, Button, Toolbar } from "@mui/material";

import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";

import { Suspense, useContext, useState } from "react";

import classes from "./MainLayout.module.css";
import ElevatedHeader from "../components/ElevatedHeader/ElevatedHeader";
import { AppContext } from "../App";
import { Link, Outlet } from "react-router-dom";
import Drawer from "../components/Drawer/Drawer";
import LoadingScreen from "../components/LoadingScreen/LoadingScreen";

export default function MainLayout() {
	const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

	const { activeTheme, setTheme } = useContext(AppContext);

	const theme = useTheme() as Theme;

	return (
		<Box sx={{ display: "flex", position: "relative" }}>
			<Drawer open={drawerOpen} setOpen={setDrawerOpen} />

			<Box component="main" sx={{ flexGrow: 1, p: 3, minWidth: 0 }}>
				<ElevatedHeader
					sx={{ background: theme.palette.background.default }}
				>
					<Toolbar>
						<IconButton onClick={() => setDrawerOpen(!drawerOpen)}>
							<MenuIcon />
						</IconButton>
						<Link className={classes.HomeLink} to={"/home"}>
							<img src="/logo.png" alt="Logo" />
						</Link>
						<Button
							onClick={() =>
								setTheme(
									activeTheme == "dark" ? "light" : "dark"
								)
							}
						>
							Toggle theme
						</Button>
					</Toolbar>
				</ElevatedHeader>

				<Suspense fallback={<LoadingScreen />}>
					<Outlet />
				</Suspense>
			</Box>
		</Box>
	);
}
