import { DateTime } from "luxon";
import {
	Calendar as BigCalendar,
	luxonLocalizer,
	SlotInfo,
	View,
} from "react-big-calendar";
import CalendarToolbar from "./components/Toolbar";
import { Box, useMediaQuery } from "@mui/material";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../../../../App";
import { App } from "../../../../types/app";
import AuthService from "../../../../services/Auth";
import LoadingScreen from "../../../../components/LoadingScreen/LoadingScreen";
import { Event } from "react-big-calendar";
import ModalContainer from "../../../../components/ModalContainer/ModalContainer";
import CreateSlotModal from "../CreateSlotModal/CreateSlotModal";
import classes from "./Calendar.module.css";
import SlotDetailsModal from "../SlotDetailsModal/SlotDetailsModal";

const localizer = luxonLocalizer(DateTime);

interface IProps {
	slots: App.Models.IScheduleSlot[] | null;
	allowAlter: boolean;
}

export default function Calendar({ slots, allowAlter }: IProps) {
	const [view, setView] = useState<View>("day");
	const [modalContent, setModalContent] = useState<JSX.Element | null>(null);

	const { activeThemeName, activeTheme } = useContext(AppContext);

	const isDesktop = useMediaQuery("(min-width: 1025px)");

	useEffect(() => {
		setView(isDesktop ? "week" : "day");
	}, [isDesktop]);

	const styling = useMemo(() => {
		return activeThemeName == "light"
			? {
					"--rbc-border-color": "#ddd",
					"--rbc-border-light-color": "#f7f7f7",
					"--rbc-today-bg-color": "#c6ddff",
					"--rbc-event-bg-color": activeTheme.palette.secondary.main,
					"--rbc-slot-in-the-past": "#efefef",
			  }
			: {
					"--rbc-border-color": "#333",
					"--rbc-border-light-color": "#292929",
					"--rbc-today-bg-color": "#141c29",
					"--rbc-event-bg-color": activeTheme.palette.secondary.main,
					"--rbc-slot-in-the-past": "#0e0e0e",
			  };
	}, [activeThemeName]);

	const openNewSlotModal = useCallback(
		(slot: SlotInfo) => {
			if (!allowAlter) return;

			const startTime = DateTime.fromJSDate(slot.start);

			if (startTime < DateTime.now()) return;

			setModalContent(
				<CreateSlotModal
					initialStartTime={startTime}
					initialEndTime={DateTime.fromJSDate(slot.end)}
				/>
			);
		},
		[allowAlter]
	);

	const openSlotDetailsModal = useCallback(
		(event: Event) => {
			const slot = slots?.find((slot) =>
				DateTime.fromISO(slot.startTime).equals(
					DateTime.fromJSDate(event.start!)
				)
			);

			if (!slot) return;

			setModalContent(
				<SlotDetailsModal slot={slot} allowEdit={allowAlter} />
			);
		},
		[slots]
	);

	if (slots == null) return <LoadingScreen />;

	return (
		<Box sx={{ ...styling }}>
			<BigCalendar<Event>
				localizer={localizer}
				views={["week", "day"]}
				view={view}
				onView={(view) => setView(view)}
				components={{
					toolbar: CalendarToolbar,
				}}
				timeslots={2}
				step={15}
				events={slots.map((slot) => ({
					start: DateTime.fromISO(slot.startTime).toJSDate(),
					end: DateTime.fromISO(slot.endTime).toJSDate(),
					title: slot.ride
						? `${AuthService.getUserFullName(
								slot.ride.course.student
						  )}`
						: "Wolny",
				}))}
				onSelectSlot={openNewSlotModal}
				selectable
				scrollToTime={DateTime.now().set({ hour: 16 }).toJSDate()}
				slotPropGetter={(date) =>
					DateTime.fromJSDate(date) < DateTime.now()
						? { className: classes.SlotInThePast }
						: {}
				}
				onSelectEvent={openSlotDetailsModal}
			/>
			<ModalContainer
				show={modalContent != null}
				onClose={() => setModalContent(null)}
			>
				{modalContent}
			</ModalContainer>
		</Box>
	);
}
