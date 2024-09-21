import { useMemo } from "react";
import classes from "../ManageSchoolPage.module.css";
import { CarRental, Folder, People, Settings } from "@mui/icons-material";
import { App } from "../../../types/app";
import { useLocation, useNavigate } from "react-router-dom";
import { ButtonBase, Paper, Typography } from "@mui/material";

export default function MainSchoolView() {
	const location = useLocation();
	const navigate = useNavigate();

	const tiles = useMemo(() => {
		const uiTiles: App.UI.IInteractiveTileDef[] = [];

		uiTiles.push({
			caption: "Pojazdy",
			type: "link",
			icon: CarRental,
			link: location.pathname + "/vehicles",
		});

		uiTiles.push({
			caption: "Instruktorzy",
			type: "link",
			icon: People,
			link: location.pathname + "/instructors",
		});

		uiTiles.push({
			caption: "Oferta",
			type: "link",
			icon: Folder,
			link: location.pathname + "/offer",
		});

		uiTiles.push({
			caption: "Zarządzaj",
			type: "link",
			icon: Settings,
			link: location.pathname + "/manage",
		});

		return uiTiles;
	}, []);

	return (
		<div className={classes.NavCardHolder}>
			{tiles.map((tiledef) => (
				<ButtonBase
					key={tiledef.caption}
					className={classes.NavCard}
					onClick={() =>
						tiledef.type == "action"
							? tiledef.action()
							: navigate(tiledef.link)
					}
				>
					<Paper className={classes.NavCardWrapper}>
						<tiledef.icon
							className={classes.CardIcon}
						></tiledef.icon>
						<Typography variant="body1">
							{tiledef.caption}
						</Typography>
						{tiledef.helperText && (
							<Typography>{tiledef.helperText}</Typography>
						)}
					</Paper>
				</ButtonBase>
			))}
		</div>
	);
}
