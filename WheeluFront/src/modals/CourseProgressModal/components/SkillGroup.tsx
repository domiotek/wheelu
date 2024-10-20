import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Typography,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import classes from "../CourseProgressModal.module.css";
import { ExpandMore } from "@mui/icons-material";
import CourseService from "../../../services/Course";
import SkillList from "./SkillList";
import { SkillLevel } from "../../../modules/enums";

interface IProps {
	groupID: string;
	expanded: boolean;
	setExpanded: (state: boolean) => void;
	skills: Record<string, SkillLevel>;
	filterMastered: boolean;
	filterQuery: string;
	onChange?: (groupID: string, skillID: string, newLevel: SkillLevel) => void;
}

export default function SkillGroup({
	groupID,
	expanded,
	setExpanded,
	skills,
	filterMastered,
	filterQuery,
	onChange,
}: IProps) {
	const [deferExpansion, setDeferExpansion] = useState<boolean>(false);
	const [stats, setStats] = useState<{ total: number; passed: number }>({
		total: 0,
		passed: 0,
	});
	const [renderedSkills, setRenderedSkills] = useState<
		[string, SkillLevel][] | null
	>(null);

	const cacheRef = useRef<[string, SkillLevel][] | null>(null);

	const expansionToggleCallback = useCallback(() => {
		setExpanded(!expanded);
	}, [expanded]);

	const onChangeCallback = useCallback(
		(skillID: string, level: SkillLevel) => {
			onChange && onChange(groupID, skillID, level);
		},
		[onChange]
	);

	useEffect(() => {
		let result: [string, SkillLevel][] = [];
		let total = 0;
		let passed = 0;

		for (const [ID, level] of Object.entries(skills)) {
			if (filterMastered && level == SkillLevel.Excelent) continue;
			if (
				filterQuery != "" &&
				!CourseService.formatCourseProgressSkill(ID).includes(
					filterQuery
				)
			)
				continue;

			total += 1;

			if (level >= SkillLevel.Good) passed += 1;

			result.push([ID, level]);
		}

		setStats({ total, passed });

		cacheRef.current = result;

		if (expanded) setRenderedSkills(result);
	}, [skills, filterMastered, filterQuery]);

	useEffect(() => {
		if (!expanded) return;

		if (renderedSkills == null) setDeferExpansion(true);
		setRenderedSkills(cacheRef.current);
	}, [expanded]);

	return (
		<Accordion
			elevation={0}
			expanded={!deferExpansion && expanded && renderedSkills != null}
			onChange={expansionToggleCallback}
		>
			<AccordionSummary
				className={classes.GroupHeader}
				expandIcon={<ExpandMore />}
			>
				<Typography>
					{CourseService.formatCourseProgressGroup(groupID)}
				</Typography>
				<Typography className={classes.StatsLabel}>
					{stats.passed} / {stats.total}
				</Typography>
			</AccordionSummary>
			<AccordionDetails>
				{(expanded || renderedSkills != null) && (
					<SkillList
						skills={renderedSkills ?? []}
						onChange={onChangeCallback}
						onRendered={() => {
							setTimeout(() => setDeferExpansion(false), 0);
						}}
					/>
				)}
			</AccordionDetails>
		</Accordion>
	);
}
