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
	isPickMode?: boolean;
	onSlotPick?: (slot: App.Models.IScheduleSlot) => void;
}

export default function Calendar({
	slots,
	allowAlter,
	isPickMode,
	onSlotPick,
}: IProps) {
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

	const findSlot = useCallback(
		(event: Event) => {
			return slots?.find((slot) =>
				DateTime.fromISO(slot.startTime).equals(
					DateTime.fromJSDate(event.start!)
				)
			);
		},
		[slots]
	);

	const slotSelect = useCallback(
		(event: Event) => {
			const slot = findSlot(event);

			if (!slot) return;

			if (isPickMode) {
				if (!slot.ride && onSlotPick) onSlotPick(slot);
			} else {
				setModalContent(
					<SlotDetailsModal slot={slot} allowEdit={allowAlter} />
				);
			}
		},
		[slots, isPickMode]
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
						: DateTime.fromISO(slot.startTime) < DateTime.now()
						? "Przeszły"
						: "Wolny",
				}))}
				onSelectSlot={openNewSlotModal}
				selectable={!isPickMode}
				scrollToTime={DateTime.now().set({ hour: 16 }).toJSDate()}
				slotPropGetter={(date) =>
					DateTime.fromJSDate(date) < DateTime.now()
						? { className: classes.SlotInThePast }
						: {}
				}
				eventPropGetter={(event) => {
					if (!isPickMode) return {};

					const slot = findSlot(event);

					return DateTime.fromJSDate(event.start!) < DateTime.now() ||
						slot?.ride
						? {
								className: classes.DisabledEvent,
						  }
						: {};
				}}
				onSelectEvent={slotSelect}
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
