import { ListItem, ToggleButton, ToggleButtonGroup } from "@mui/material";
import classes from "../ExamItemList.module.css";
import { CheckCircleOutline, Warning, WarningAmber } from "@mui/icons-material";
import { ExamCriteriumState } from "../../../modules/enums";
import { ExamService } from "../../../services/Exam";
import { c } from "../../../modules/utils";

interface IProps {
	itemID: App.Models.ExamResult.CriteriaTypes;
	state: ExamCriteriumState;
	flagged: boolean;
	onChange?: (
		itemID: App.Models.ExamResult.CriteriaTypes,
		state: ExamCriteriumState
	) => void;
}

export default function Item({ itemID, state, flagged, onChange }: IProps) {
	return (
		<ListItem
			className={c([classes.Item, [classes.FlaggedItem, flagged]])}
			divider
		>
			{ExamService.formatCriteriumItem(itemID)}
			<ToggleButtonGroup
				size="small"
				exclusive
				color={ExamService.criteriumStateColorMapping[state]}
				value={state}
				onChange={(_ev, val) => onChange!(itemID, val)}
				disabled={!onChange}
			>
				<ToggleButton value={ExamCriteriumState.FailedOnce}>
					<WarningAmber color="warning" />
				</ToggleButton>
				<ToggleButton value={ExamCriteriumState.FailedTwice}>
					<Warning color="error" />
				</ToggleButton>
				<ToggleButton value={ExamCriteriumState.Passed}>
					<CheckCircleOutline color="success" />
				</ToggleButton>
			</ToggleButtonGroup>
		</ListItem>
	);
}
