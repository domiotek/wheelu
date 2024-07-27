import { Card, CircularProgress, Grid } from '@mui/material'


export default function SuspensePortal() {
	return (
		<Card sx={{maxWidth: 420, maxHeight: 320, width: "100%", height: "100%", m:2}}>
			<Grid justifyContent="center" alignItems="center" container sx={{height: "100%"}}>
				<CircularProgress />
			</Grid>
		</Card>
	)
}
