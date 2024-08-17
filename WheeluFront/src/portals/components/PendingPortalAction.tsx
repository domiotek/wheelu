import { Card, CircularProgress, Stack, Typography } from '@mui/material'
import commonClasses from "../Common.module.css";

export default function PendingPortalAction() {
	return (
		<Card sx={{maxWidth: 420, width: "100%", m: 2, p: {xs: 2, sm: 4}}}>
			<Stack alignItems="center" gap="0.5em">
				<img className={commonClasses.Logo} src="/logo.png" alt="Wheelu Logo" />
				<Typography variant="h5">Jeszcze tylko chwila</Typography>
				<Typography variant="body2" gutterBottom>Sprawdzamy parę rzeczy...</Typography>

				<CircularProgress />
			</Stack>
		</Card>
	)
}
