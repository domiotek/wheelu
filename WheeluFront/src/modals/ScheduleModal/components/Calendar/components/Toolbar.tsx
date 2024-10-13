import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import {
	Card,
	CardContent,
	Chip,
	IconButton,
	Paper,
	Popover,
	useMediaQuery,
} from "@mui/material";
import { Event, ToolbarProps } from "react-big-calendar";
import classes from "./Toolbar.module.css";
import { useMemo, useRef, useState } from "react";
import { DateTime } from "luxon";
import { DateCalendar } from "@mui/x-date-pickers";
import WeekPicker from "./WeekPicker";

export default function CalendarToolbar({
	onNavigate,
	label,
	date,
}: ToolbarProps<Event>) {
	const [popoverOpen, setPopoverOpen] = useState(false);

	const isDesktop = useMediaQuery("(min-width: 1025px)");

	const dateTime = useMemo(() => DateTime.fromJSDate(date), [date]);

	const popoverAnchorRef = useRef<HTMLDivElement>(null);

	return (
		<Paper className={classes.Container}>
			<div className={classes.NavButtons}>
				<IconButton onClick={() => onNavigate("PREV")} color="primary">
					<ChevronLeft />
				</IconButton>
				<IconButton onClick={() => onNavigate("NEXT")} color="primary">
					<ChevronRight />
				</IconButton>
			</div>

			<Chip
				ref={popoverAnchorRef}
				label={label}
				onClick={() => setPopoverOpen(true)}
			/>

			<Popover
				open={popoverOpen}
				anchorEl={popoverAnchorRef.current}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
				transformOrigin={{ vertical: "top", horizontal: "center" }}
				onClose={() => setPopoverOpen(false)}
			>
				<Card>
					<CardContent className={classes.PopoverContent}>
						{isDesktop ? (
							<WeekPicker
								value={dateTime}
								onChange={(date: DateTime) => {
									onNavigate("DATE", date.toJSDate());
									setPopoverOpen(false);
								}}
							/>
						) : (
							<DateCalendar
								value={dateTime}
								onChange={(date: DateTime) => {
									onNavigate("DATE", date.toJSDate());
									setPopoverOpen(false);
								}}
							/>
						)}
					</CardContent>
				</Card>
			</Popover>
		</Paper>
	);
}
