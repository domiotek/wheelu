import React, { useContext, useLayoutEffect, useMemo, useState } from "react";
import { ModalContext } from "../../components/ModalContainer/ModalContainer";
import classes from "./ScheduleModal.module.css";
import { Typography } from "@mui/material";
import Calendar from "./components/Calendar/Calendar";
import { QueryKey, useQuery } from "@tanstack/react-query";
import { API } from "../../types/api";
import { callAPI } from "../../modules/utils";
import { DateTime } from "luxon";
import { AppContext } from "../../App";
import UnavailableCover from "./components/Calendar/components/UnavailableCover";

interface IProps {
	instructorID: number;
	allowAlter: boolean;
	mode?: "view" | "pick";
	onPick?: (slot: App.Models.IScheduleSlot) => void;
}

interface IContext {
	instructorID: number;
	baseQuery: QueryKey;
}

export const ScheduleContext = React.createContext<IContext>({
	instructorID: null as any,
	baseQuery: null as any,
});

export default function InstructorScheduleModal({
	instructorID,
	allowAlter,
	mode = "view",
	onPick,
}: IProps) {
	const [selectedDay, setSelectedDay] = useState<DateTime>(DateTime.now());

	const { userDetails } = useContext(AppContext);
	const { setHostClassName, closeModal } = useContext(ModalContext);

	useLayoutEffect(() => {
		setHostClassName(classes.Modal);
	}, []);

	const weekBoundaries = useMemo(() => {
		const first = selectedDay.startOf("week");
		return [first, first.plus({ day: 7 })];
	}, [selectedDay]);

	const queryKey = useMemo(() => {
		return [
			"Instructors",
			"#",
			instructorID,
			"Schedule",
			weekBoundaries[0].toISODate(),
			"-",
			weekBoundaries[1].toISODate(),
		];
	}, [weekBoundaries]);

	const isEmployed = useMemo(() => {
		return userDetails?.instructorProfile?.activeEmployment != undefined;
	}, [userDetails]);

	const { data, isFetching } = useQuery<
		API.Schedule.GetSlotsOfInstructor.IResponse,
		API.Schedule.GetSlotsOfInstructor.IEndpoint["error"]
	>({
		queryKey,
		queryFn: () =>
			callAPI<API.Schedule.GetSlotsOfInstructor.IEndpoint>(
				"GET",
				"/api/v1/instructors/:instructorID/schedule",
				{
					after: weekBoundaries[0].toISODate()!,
					before: weekBoundaries[1].toISODate()!,
				},
				{ instructorID }
			),
		retry: true,
		staleTime: 60000,
		enabled: isEmployed,
	});

	return (
		<div className={classes.ModalContent}>
			<Typography variant="h4" gutterBottom>
				Grafik instruktora
			</Typography>
			<ScheduleContext.Provider
				value={{
					instructorID,
					baseQuery: queryKey,
				}}
			>
				<Calendar
					slots={data ?? null}
					allowAlter={allowAlter}
					isPickMode={mode == "pick"}
					onSlotPick={(slot) => {
						onPick && onPick(slot);
						closeModal();
					}}
					onDateChange={setSelectedDay}
					loading={isFetching}
				/>
			</ScheduleContext.Provider>

			{!isEmployed && <UnavailableCover />}
		</div>
	);
}
