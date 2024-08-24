import { Button, Divider, Typography } from '@mui/material'
import ApplicationsTable from '../components/ApplicationsTable/ApplicationsTable'
import classes from "./Main.module.css";
import { FilterAlt } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function Main() {

	const navigate = useNavigate();

	return (
		<>
			<Typography className={classes.SectionHeadline} variant="overline">
				Aplikacje
			</Typography>
			<Divider />
			<section className={classes.TableSection}>
				<Button startIcon={<FilterAlt />} onClick={()=>navigate("/panel/applications")}>Filter</Button>
				<ApplicationsTable />
			</section>
		</>
		
	)
}
