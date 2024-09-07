import { Typography } from "@mui/material";
import SchoolPage from "./SchoolPage";

export default function SchoolPageWrapper() {
	return (
		<>
			<Typography variant="h4" sx={{ml: 4, mb: 2}}>Twoja szkoła jazdy</Typography>
			<SchoolPage viewPoint="owner" />
		</>
	)
}
