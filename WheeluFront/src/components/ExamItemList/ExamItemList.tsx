import { Checkbox, FormControlLabel, TextField } from "@mui/material";
import { useMemo, useRef, useState } from "react";
import classes from "./ExamItemList.module.css";
import SimpleBar from "simplebar-react";
import ItemGroup from "./components/ItemGroup";
import { CourseCategory, ExamCriteriumState } from "../../modules/enums";

interface IProps {
	className?: string;
	itemGroups: Record<
		string,
		Record<string, App.Models.ExamResult.IExamCriterium>
	>;
	courseCategory: CourseCategory;
	updateItemState?: (
		groupID: string,
		itemID: string,
		state: ExamCriteriumState
	) => void;
}

export default function ExamItemList({
	className,
	itemGroups,
	courseCategory,
	updateItemState,
}: IProps) {
	const [intelligentSorting, setIntelligentSorting] =
		useState<boolean>(false);
	const [query, setQuery] = useState<string>("");
	const [commitedQuery, setCommittedQuery] = useState<string>("");

	const queryDeferTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined
	);
	const hostRef = useRef<HTMLDivElement>(null);

	const updateQueryCallback = (newQuery: string) => {
		setQuery(newQuery);
		clearTimeout(queryDeferTimeout.current);

		queryDeferTimeout.current = setTimeout(() => {
			if (query !== newQuery) setCommittedQuery(newQuery);
		}, 700);
	};

	const listMemo = useMemo(() => {
		return Object.keys(itemGroups).map((group) => {
			return (
				<ItemGroup
					key={group}
					groupID={group}
					items={itemGroups[group]}
					filterQuery={commitedQuery}
					intelligentSorting={intelligentSorting}
					courseCategory={courseCategory}
					onChange={updateItemState}
					scrollerRef={
						(hostRef.current?.querySelector(
							".simplebar-content-wrapper"
						) as Node) ?? undefined
					}
				/>
			);
		});
	}, [commitedQuery, intelligentSorting, itemGroups]);

	return (
		<div className={className} ref={hostRef}>
			<div className={classes.FilterBox}>
				<TextField
					label="Wyszukaj"
					size="small"
					value={query}
					onChange={(ev) => updateQueryCallback(ev.target.value)}
				/>
				<FormControlLabel
					control={
						<Checkbox
							value={intelligentSorting}
							onChange={(_ev, val) => setIntelligentSorting(val)}
						/>
					}
					label="Inteligentne sortowanie"
				/>
			</div>

			<SimpleBar className={classes.ScrollBox}>{listMemo}</SimpleBar>
		</div>
	);
}
