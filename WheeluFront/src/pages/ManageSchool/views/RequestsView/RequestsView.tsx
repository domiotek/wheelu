import React, { useCallback, useContext, useMemo, useState } from "react";
import { OutsideContextNotifier } from "../../../../modules/utils";
import ViewWrapper from "../Wrapper";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { SchoolPageContext } from "../../ManageSchoolPage";
import ChangeInstructorRequestTable from "./components/ChangeInstructorRequestTable";
import { Button } from "@mui/material";
import { FilterAlt } from "@mui/icons-material";
import classes from "../common.module.css";

interface IContext {
	queryKey: (string | number)[];
	invalidateQuery: () => void;
}

export const RequestsViewContext = React.createContext<IContext>({
	invalidateQuery: OutsideContextNotifier,
	queryKey: [],
});

export default function RequestsView() {
	const [filteringEnabled, setFilteringEnabled] = useState(false);

	const { schoolData } = useContext(SchoolPageContext);

	const params = useParams();
	const qClient = useQueryClient();

	const queryKey = useMemo(
		() => ["Schools", "#", schoolData!.id, "Courses"],
		[params]
	);
	const invalidateQuery = useCallback(() => {
		qClient.invalidateQueries({
			queryKey: queryKey,
		});
	}, [queryKey]);

	return (
		<ViewWrapper headline="Wnioski">
			<RequestsViewContext.Provider
				value={{ invalidateQuery, queryKey: queryKey }}
			>
				{!filteringEnabled && (
					<div className={classes.SectionHeader}>
						<span></span>
						<Button
							startIcon={<FilterAlt />}
							onClick={() => setFilteringEnabled(true)}
						>
							Filtruj
						</Button>
					</div>
				)}

				<ChangeInstructorRequestTable
					schoolID={parseInt(params["id"] ?? "")}
					supportFilter={filteringEnabled}
				/>
			</RequestsViewContext.Provider>
		</ViewWrapper>
	);
}
