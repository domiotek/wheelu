import {
	CheckCircleOutline,
	CircleOutlined,
	Outbound,
	Verified,
} from "@mui/icons-material";
import { ListItem, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { SkillLevel } from "../../../modules/enums";
import classes from "../CourseProgressModal.module.css";
import CourseService from "../../../services/Course";

interface IProps {
	skillID: string;
	skillLevel: SkillLevel;
	onChange?: (skillID: string, newLevel: SkillLevel) => void;
}

export default function Skill({ skillID, skillLevel, onChange }: IProps) {
	return (
		<ListItem className={classes.SkillItem} divider>
			{CourseService.formatCourseProgressSkill(skillID)}
			<ToggleButtonGroup
				className={classes.SkillScale}
				size="small"
				exclusive
				color={CourseService.skillColorMapping[skillLevel]}
				value={skillLevel}
				onChange={(_ev, val) => onChange!(skillID, val)}
				disabled={!onChange}
			>
				<ToggleButton value={SkillLevel.None}>
					<CircleOutlined />
				</ToggleButton>
				<ToggleButton value={SkillLevel.Medium}>
					<Outbound color="warning" />
				</ToggleButton>
				<ToggleButton value={SkillLevel.Good}>
					<CheckCircleOutline color="info" />
				</ToggleButton>
				<ToggleButton value={SkillLevel.Excelent}>
					<Verified color="success" />
				</ToggleButton>
			</ToggleButtonGroup>
		</ListItem>
	);
}
