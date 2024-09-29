import {
	Divider,
	List,
	ListItem,
	ListItemText,
	Typography,
} from "@mui/material";
import { App } from "../../../types/app";
import InlineDot from "../../../components/InlineDot/InlineDot";
import AuthService from "../../../services/Auth";
import { CurrencyFormatter } from "../../../modules/formatters";
import classes from "./CartView.module.css";
import commonClasses from "../BuyCourseModal.module.css";

interface IProps {
	course: App.Models.ICourseOffer;
	selectedInstructor: App.Models.IShortUser;
}

export default function CartView({ course, selectedInstructor }: IProps) {
	return (
		<section className={classes.Container}>
			<Typography variant="h6">Podsumowanie</Typography>
			<Divider />
			<List>
				<ListItem className={commonClasses.ListItem} divider>
					<ListItemText
						primary={`Kurs kategorii ${course.category.name}`}
						secondary={
							<>
								{course.hoursCount} godzin <InlineDot />{" "}
								Instruktor{" "}
								{AuthService.getUserFullName(
									selectedInstructor
								)}
							</>
						}
					/>
					<Typography>
						{CurrencyFormatter.format(course.price)}
					</Typography>
				</ListItem>
			</List>
			<div className={classes.TotalSection}>
				<Typography variant="h6">
					Razem: {CurrencyFormatter.format(course.price)}
				</Typography>
				<Typography variant="caption">w tym VAT</Typography>
			</div>
		</section>
	);
}
