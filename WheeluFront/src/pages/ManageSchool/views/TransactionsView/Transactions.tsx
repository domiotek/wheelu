import ViewWrapper from "../Wrapper";
import TransactionsTable from "../../../../components/TransactionsTable/TransactionsTable";
import { useParams } from "react-router-dom";
import React, { useMemo, useState } from "react";
import { Button } from "@mui/material";
import { FilterAlt } from "@mui/icons-material";
import classes from "../common.module.css";

interface IContext {
	queryKey: (string | number)[];
}

export const TransactionsViewContext = React.createContext<IContext>({
	queryKey: [],
});

export default function TransactionsView() {
	const [filter, setFilter] = useState(false);

	const params = useParams();

	const queryKey = useMemo(
		() => ["Schools", "#", parseInt(params["id"] ?? ""), "Transactions"],
		[params]
	);

	return (
		<ViewWrapper headline="Transakcje">
			<TransactionsViewContext.Provider value={{ queryKey: queryKey }}>
				{!filter && (
					<div className={classes.SectionHeader}>
						<span></span>
						<Button
							startIcon={<FilterAlt />}
							onClick={() => setFilter(true)}
						>
							Filtruj
						</Button>
					</div>
				)}
				<TransactionsTable
					schoolID={parseInt(params["id"] ?? "")}
					supportFilter={filter}
				/>
			</TransactionsViewContext.Provider>
		</ViewWrapper>
	);
}
