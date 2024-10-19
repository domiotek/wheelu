import {
	Divider,
	List,
	ListItem,
	ListItemText,
	Typography,
} from "@mui/material";
import { App } from "../../../types/app";
import { CurrencyFormatter } from "../../../modules/formatters";
import classes from "./CartView.module.css";
import commonClasses from "../PurchaseFlow.module.css";
import { useMemo } from "react";
import { formatPolishWordSuffix } from "../../../modules/utils";

interface IProps {
	items: App.UI.PurchaseFlow.ICartItemDef[];
}

export default function CartView({ items }: IProps) {
	const total = useMemo(() => {
		return items.reduce<number>(
			(sum, item) => sum + item.count * item.pricePerItem,
			0
		);
	}, []);

	return (
		<section className={classes.Container}>
			<Typography variant="h6">Podsumowanie</Typography>
			<Divider />
			<List>
				{items.map((item) => (
					<ListItem
						key={item.name}
						className={commonClasses.ListItem}
						divider
					>
						<ListItemText
							primary={item.name}
							secondary={item.helper}
						/>
						<Typography>
							{item.count} sztuk
							{formatPolishWordSuffix(item.count, ["a", "i", ""])}
						</Typography>
						<Typography>
							{CurrencyFormatter.format(
								item.count * item.pricePerItem
							)}
						</Typography>
					</ListItem>
				))}
			</List>
			<div className={classes.TotalSection}>
				<Typography variant="h6">
					Razem: {CurrencyFormatter.format(total)}
				</Typography>
				<Typography variant="caption">w tym VAT</Typography>
			</div>
		</section>
	);
}
