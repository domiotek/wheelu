import {
	List,
	ListItem,
	ListItemText,
	TextField,
	Typography,
} from "@mui/material";
import classes from "./PersonalizeView.module.css";
import { CurrencyFormatter } from "../../../modules/formatters";
interface IProps {
	course: App.Models.ICourse;
	hoursCount: number | null;
	updateHoursCount: (id: number) => void;
}

export default function PersonalizeView({
	course,
	hoursCount,
	updateHoursCount,
}: IProps) {
	return (
		<section>
			<Typography variant="overline">Dobierz ilość godzin</Typography>
			<List>
				<ListItem className={classes.ListItem} divider>
					<ListItemText
						primary="Dodatkowa godzina"
						secondary="Potrzebujesz dodatkowego czasu? Dokup jedną lub więcej godzin."
					/>

					<Typography variant="h6">
						{CurrencyFormatter.format(course.pricePerHour)}
					</Typography>
					<TextField
						className={classes.Input}
						label="#"
						size="small"
						type="number"
						value={hoursCount}
						inputProps={{ min: 1 }}
						onChange={(ev) =>
							updateHoursCount(parseInt(ev.target.value))
						}
					/>
				</ListItem>
			</List>
		</section>
	);
}
