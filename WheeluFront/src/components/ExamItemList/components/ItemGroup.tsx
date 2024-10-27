import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	List,
	ListItem,
	Typography,
} from "@mui/material";
import classes from "../ExamItemList.module.css";
import { useCallback, useEffect, useRef, useState } from "react";
import Item from "./Item";
import { ExamService } from "../../../services/Exam";
import { CourseCategory, ExamCriteriumState } from "../../../modules/enums";

interface IProps {
	groupID: string;
	items: Record<
		App.Models.ExamResult.CriteriaTypes,
		App.Models.ExamResult.IExamCriterium
	>;
	filterQuery: string;
	intelligentSorting: boolean;
	courseCategory: CourseCategory;
	onChange?: (
		groupID: string,
		itemID: App.Models.ExamResult.CriteriaTypes,
		state: ExamCriteriumState
	) => void;
	scrollerRef: Node;
}

export default function ItemGroup({
	groupID,
	items,
	filterQuery,
	intelligentSorting,
	courseCategory,
	onChange,
}: IProps) {
	const [renderedItems, setRenderedItems] = useState<
		| [
				App.Models.ExamResult.CriteriaTypes,
				App.Models.ExamResult.IExamCriterium
		  ][]
		| null
	>(null);

	const flaggedItemsRef = useRef<Set<string>>(new Set());

	const onChangeCallback = useCallback(
		(
			skillID: App.Models.ExamResult.CriteriaTypes,
			state: ExamCriteriumState
		) => {
			onChange && onChange(groupID, skillID, state);
		},
		[onChange]
	);

	useEffect(() => {
		let result: [
			App.Models.ExamResult.CriteriaTypes,
			App.Models.ExamResult.IExamCriterium
		][] = [];

		for (const [ID, state] of Object.entries(items)) {
			if (state.hiddenIn.includes(courseCategory)) continue;

			if (
				filterQuery != "" &&
				!ExamService.formatCriteriumItem(
					ID as App.Models.ExamResult.CriteriaTypes
				).includes(filterQuery)
			)
				continue;

			if (state.state != ExamCriteriumState.Passed)
				flaggedItemsRef.current.add(ID);
			else flaggedItemsRef.current.delete(ID);

			result.push([ID as App.Models.ExamResult.CriteriaTypes, state]);
		}

		setRenderedItems(result);
	}, [items, filterQuery]);

	return (
		<Accordion elevation={0} expanded={true} disableGutters>
			<AccordionSummary
				className={classes.GroupHeader}
				sx={{
					"--local-bg-color": (theme) =>
						theme.palette.background.default,
				}}
			>
				<Typography>
					{ExamService.formatCriteriaGroup(groupID)}
				</Typography>
			</AccordionSummary>
			<AccordionDetails>
				<List className={classes.ItemList}>
					{renderedItems?.map(([ID, item]) => (
						<Item
							key={ID}
							itemID={ID}
							state={item.state}
							flagged={
								intelligentSorting &&
								flaggedItemsRef.current.has(ID)
							}
							onChange={onChangeCallback}
						/>
					))}
					{renderedItems?.length == 0 && (
						<ListItem className={classes.NoResultsMessage}>
							<Typography variant="body2">
								Brak wyników spęłniających kryteria.
							</Typography>
						</ListItem>
					)}
				</List>
			</AccordionDetails>
		</Accordion>
	);
}
