import { Button, Divider, Typography } from '@mui/material'
import ApplicationsTable from '../components/ApplicationsTable/ApplicationsTable'
import classes from "./Main.module.css";
import { FilterAlt } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SchoolsTable from '../components/SchoolsTable/SchoolsTable';

interface IProps {
	header: string
	link: string
	children: JSX.Element
}

function TableSection({header, link, children}: IProps) {

	const navigate = useNavigate();

	return (
		<>
			<Typography className={classes.SectionHeadline} variant="overline">
				{header}
			</Typography>
			<Divider />
			<section className={classes.TableSection}>
				<Button startIcon={<FilterAlt />} onClick={()=>navigate(link)}>Filtruj</Button>
				{children}
			</section>
		</>
	);
}

export default function Main() {

	return (
		<div className={classes.ContentWrapper}>
			<TableSection header='Wnioski' link='/panel/applications'>
				<ApplicationsTable />
			</TableSection>
			
			<TableSection header='Szkoły' link='/panel/schools'>
				<SchoolsTable />
			</TableSection>
		</div>
		
	)
}
