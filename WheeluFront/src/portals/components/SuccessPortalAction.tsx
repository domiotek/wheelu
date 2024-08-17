import { Button, Card, Stack, Typography } from '@mui/material'
import commonClasses from "../Common.module.css";
import { useNavigate } from 'react-router-dom';

interface IProps {
	message: string
	link: string
}

export default function SuccessPortalAction({message, link}: IProps) {
	const navigate = useNavigate();

	return (
		<Card sx={{maxWidth: 420, width: "100%", m: 2, p: {xs: 2, sm: 4}}}>
			<Stack alignItems="center" gap="0.5em">
				<img className={commonClasses.Logo} src="/logo.png" alt="Wheelu Logo" />
				<Typography variant="h5">Gotowe!</Typography>
				<Typography variant="body2" gutterBottom>{message}</Typography>

				<Button variant='contained' onClick={()=>navigate(link)}>Powrót</Button>
			</Stack>
		</Card>
	)
}
