import { useContext, useMemo } from "react";
import classes from "../ManageSchoolPage.module.css";
import {
	CarRental,
	Folder,
	Grading,
	People,
	ReceiptLong,
	Reviews,
	School,
	Settings,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { ButtonBase, Paper, Typography } from "@mui/material";
import { SchoolPageContext } from "../ManageSchoolPage";

export default function MainSchoolView() {
	const { access } = useContext(SchoolPageContext);

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
			caption: "Kursy",
			type: "link",
			icon: School,
			link: location.pathname + "/courses",
		});

		uiTiles.push({
			caption: "Oferta",
			type: "link",
			icon: Folder,
			link: location.pathname + "/offer",
		});

		uiTiles.push({
			caption: "Opinie",
			type: "link",
			icon: Reviews,
			link: location.pathname + "/reviews",
		});

		if (access != "instructor") {
			uiTiles.push({
				caption: "Transakcje",
				type: "link",
				icon: ReceiptLong,
				link: location.pathname + "/transactions",
			});

			uiTiles.push({
				caption: "Wnioski",
				type: "link",
				icon: Grading,
				link: location.pathname + "/requests",
			});

			uiTiles.push({
				caption: "Zarządzaj",
				type: "link",
				icon: Settings,
				link: location.pathname + "/manage",
			});
		}

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
