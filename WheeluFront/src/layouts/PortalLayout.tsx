import { Grid } from "@mui/material";
import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import SuspensePortal from "../portals/SuspensePortal";

export default function PortalLayout() {
	return (
		<Grid sx={{height: "100%"}} alignItems="center" justifyContent="center" container>
			<Suspense fallback={<SuspensePortal />}>
				<Outlet />
			</Suspense>
		</Grid>
	)
}
