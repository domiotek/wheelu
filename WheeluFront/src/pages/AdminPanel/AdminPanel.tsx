import { Breadcrumbs, Typography } from "@mui/material";
import { useContext, useEffect, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ILevelLeaf, RenderBreadcrumbs } from "../../modules/features";
import classes from "./AdminPanel.module.css";
import { NavigateNext } from "@mui/icons-material";
import { AppContext } from "../../App";
import { AccessLevel } from "../../modules/enums";

export default function AdminPanel() {
	const { accessLevel } = useContext(AppContext);

	const location = useLocation();
	const navigate = useNavigate();

	const breadcrumbs = useMemo(() => {
		return RenderBreadcrumbs(
			location.pathname,
			{ rootLink: "/panel" },
			[
				{ id: "applications", label: "Wnioski", link: "applications" },
				{ id: "schools", label: "Szkoły", link: "schools" },
				{ id: "users", label: "Użytkownicy", link: "users" },
			],
			new Map<string, ILevelLeaf[]>([
				[
					"applications",
					[{ id: "index", label: "Rozpatrz wniosek", link: "#" }],
				],
				[
					"schools",
					[{ id: "index", label: "Profil szkoły", link: "#" }],
				],
			])
		);
	}, [location]);

	useEffect(() => {
		if (accessLevel != AccessLevel.Administrator) navigate("/home");
	}, []);

	return (
		<>
			<Typography variant="h5" gutterBottom>
				Panel Administratora
			</Typography>

			<Breadcrumbs aria-label="breadcrumb" separator={<NavigateNext />}>
				{breadcrumbs.map((elem) => elem)}
			</Breadcrumbs>

			<div className={classes.ContentWindow}>
				<Outlet />
			</div>
		</>
	);
}
