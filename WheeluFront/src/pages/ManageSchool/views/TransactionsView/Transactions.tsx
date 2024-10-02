import ViewWrapper from "../Wrapper";
import TransactionsTable from "./components/TransactionsTable";
import { useParams } from "react-router-dom";
import React, { useMemo } from "react";

interface IContext {
	queryKey: (string | number)[];
}

export const TransactionsViewContext = React.createContext<IContext>({
	queryKey: [],
});

export default function OfferSchoolView() {
	const params = useParams();

	const queryKey = useMemo(
		() => ["Schools", "#", parseInt(params["id"] ?? ""), "Transactions"],
		[params]
	);

	return (
		<ViewWrapper headline="Transakcje">
			<TransactionsViewContext.Provider value={{ queryKey: queryKey }}>
				<TransactionsTable schoolID={parseInt(params["id"] ?? "")} />
			</TransactionsViewContext.Provider>
		</ViewWrapper>
	);
}
