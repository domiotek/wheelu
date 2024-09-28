import ViewWrapper from "../Wrapper";
import CourseTable from "./components/CourseTable";
import { useParams } from "react-router-dom";
import React, { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { OutsideContextNotifier } from "../../../../modules/utils";
import classes from "../common.module.css";
import { Button } from "@mui/material";
import { FilterAlt } from "@mui/icons-material";

interface IContext {
	queryKey: (string | number)[];
	invalidateQuery: () => void;
}

export const CourseOffersContext = React.createContext<IContext>({
	invalidateQuery: OutsideContextNotifier,
	queryKey: [],
});

export default function CoursesSchoolView() {
	const [filteringEnabled, setFilteringEnabled] = useState(false);

	const params = useParams();
	const qClient = useQueryClient();

	const queryKey = useMemo(
		() => ["Schools", "#", parseInt(params["id"] ?? ""), "Courses"],
		[params]
	);
	const invalidateQuery = useCallback(() => {
		qClient.invalidateQueries({
			queryKey: queryKey,
		});
	}, [queryKey]);

	return (
		<ViewWrapper headline="Kursy">
			<CourseOffersContext.Provider
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

				<CourseTable
					schoolID={parseInt(params["id"] ?? "")}
					supportFilter={filteringEnabled}
				/>
			</CourseOffersContext.Provider>
		</ViewWrapper>
	);
}
