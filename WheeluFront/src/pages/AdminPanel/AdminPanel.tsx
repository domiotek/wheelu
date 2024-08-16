import classes from "./AdminPanel.module.css";

import { Divider, Typography } from "@mui/material";
import ApplicationsTable from "./components/ApplicationsTable/ApplicationsTable";

export default function AdminPanel() {

	return (
		<>
			<Typography variant="h5" gutterBottom>
				Panel Administratora
			</Typography>

			<Typography variant="overline">
				Aplikacje
			</Typography>
			<Divider />
			<section className={classes.TableSection}>
				<ApplicationsTable />
			</section>
		</>
	)
}
