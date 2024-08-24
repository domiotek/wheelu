import { Breadcrumbs, Typography } from "@mui/material";
import {  useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ILevelLeaf, RenderBreadcrumbs } from "../../modules/features";
import classes from "./AdminPanel.module.css";
import { NavigateNext } from "@mui/icons-material";

export default function AdminPanel() {

	const location = useLocation();

	const breadcrumbs = useMemo(()=>{
		return RenderBreadcrumbs(
			location.pathname, 
			{rootLink: "/panel"},
			[
				{id: "applications", label: "Wnioski", link: "applications"}
			],
			new Map<string, ILevelLeaf[]>([
					["applications", [
						{id:  "index", label: "Rozpatrz wniosek", link: "#"}
					]]
			])
		);
	},[location]);

	return (
		<>
			<Typography variant="h5" gutterBottom>
				Panel Administratora
			</Typography>

			<Breadcrumbs aria-label="breadcrumb" separator={<NavigateNext />}>
				{ breadcrumbs.map(elem=>elem) }
			</Breadcrumbs>
			
			<div className={classes.ContentWindow}>
				<Outlet />
			</div>
		</>
	)
}
