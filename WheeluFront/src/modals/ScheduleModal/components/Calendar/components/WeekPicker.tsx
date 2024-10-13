import * as React from "react";
import { styled } from "@mui/material/styles";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay, PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import { DateTime } from "luxon";

interface CustomPickerDayProps extends PickersDayProps<DateTime> {
	isSelected: boolean;
	isHovered: boolean;
}

const CustomPickersDay = styled(PickersDay, {
	shouldForwardProp: (prop) => prop !== "isSelected" && prop !== "isHovered",
})<CustomPickerDayProps>(({ theme, isSelected, isHovered, day }) => ({
	borderRadius: 0,
	...(isSelected && {
		backgroundColor: theme.palette.primary.main,
		color: theme.palette.primary.contrastText,
		"&:hover, &:focus": {
			backgroundColor: theme.palette.primary.main,
		},
	}),
	...(isHovered && {
		backgroundColor: theme.palette.primary.light,
		"&:hover, &:focus": {
			backgroundColor: theme.palette.primary.light,
		},
		...theme.applyStyles("dark", {
			backgroundColor: theme.palette.primary.dark,
			"&:hover, &:focus": {
				backgroundColor: theme.palette.primary.dark,
			},
		}),
	}),
	...(day.day === 0 && {
		borderTopLeftRadius: "50%",
		borderBottomLeftRadius: "50%",
	}),
	...(day.day === 6 && {
		borderTopRightRadius: "50%",
		borderBottomRightRadius: "50%",
	}),
})) as React.ComponentType<CustomPickerDayProps>;

const isInSameWeek = (dayA: DateTime, dayB: DateTime | null | undefined) => {
	if (dayB == null) {
		return false;
	}

	return dayA.hasSame(dayB, "week");
};

function Day(
	props: PickersDayProps<DateTime> & {
		selectedDay?: DateTime | null;
		hoveredDay?: DateTime | null;
	}
) {
	const { day, selectedDay, hoveredDay, ...other } = props;

	return (
		<CustomPickersDay
			{...other}
			day={day}
			sx={{ px: 2.5 }}
			disableMargin
			selected={false}
			isSelected={isInSameWeek(day, selectedDay)}
			isHovered={isInSameWeek(day, hoveredDay)}
		/>
	);
}

interface IProps {
	value: DateTime;
	onChange: (date: DateTime) => void;
}

export default function WeekPicker({ value, onChange }: IProps) {
	const [hoveredDay, setHoveredDay] = React.useState<DateTime | null>(null);

	return (
		<DateCalendar
			value={value}
			onChange={(newValue) => onChange(newValue)}
			showDaysOutsideCurrentMonth
			slots={{ day: Day }}
			slotProps={{
				day: (ownerState) =>
					({
						selectedDay: value,
						hoveredDay,
						onPointerEnter: () => setHoveredDay(ownerState.day),
						onPointerLeave: () => setHoveredDay(null),
					} as any),
			}}
		/>
	);
}
