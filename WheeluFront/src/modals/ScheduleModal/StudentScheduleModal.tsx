import React, {
	useCallback,
	useContext,
	useLayoutEffect,
	useMemo,
	useState,
} from "react";
import { ModalContext } from "../../components/ModalContainer/ModalContainer";
import classes from "./ScheduleModal.module.css";
import { Typography } from "@mui/material";
import Calendar from "./components/Calendar/Calendar";
import { QueryKey, useQuery } from "@tanstack/react-query";
import { API } from "../../types/api";
import { callAPI } from "../../modules/utils";
import { DateTime } from "luxon";
import { CourseCategoryFormatter } from "../../modules/formatters";

interface IProps {
	studentID: string;
}

interface IContext {
	instructorID: number;
	baseQuery: QueryKey;
}

export const ScheduleContext = React.createContext<IContext>({
	instructorID: null as any,
	baseQuery: null as any,
});

export default function StudentScheduleModal({ studentID }: IProps) {
	const [selectedDay, setSelectedDay] = useState<DateTime>(DateTime.now());

	const { setHostClassName } = useContext(ModalContext);

	useLayoutEffect(() => {
		setHostClassName(classes.Modal);
	}, []);

	const weekBoundaries = useMemo(() => {
		const first = selectedDay.startOf("week");
		return [first, first.plus({ day: 7 })];
	}, [selectedDay]);

	const queryKey = useMemo(() => {
		return [
			"Users",
			"#",
			studentID,
			"Schedule",
			weekBoundaries[0].toISODate(),
			"-",
			weekBoundaries[1].toISODate(),
		];
	}, [weekBoundaries, studentID]);

	const { data, isFetching } = useQuery<
		API.Schedule.GetSlotsOfStudent.IResponse,
		API.Schedule.GetSlotsOfStudent.IEndpoint["error"]
	>({
		queryKey,
		queryFn: () =>
			callAPI<API.Schedule.GetSlotsOfStudent.IEndpoint>(
				"GET",
				"/api/v1/users/:userID/schedule",
				{
					after: weekBoundaries[0].toISODate()!,
					before: weekBoundaries[1].toISODate()!,
				},
				{ userID: studentID }
			),
		retry: true,
		staleTime: 60000,
	});

	const slotTitleFactory = useCallback((slot: App.Models.IScheduleSlot) => {
		return `${
			slot.ride!.examId ? "Egzamin" : "Jazda"
		} - kategoria ${CourseCategoryFormatter.format(
			slot.ride!.course.category
		)}`;
	}, []);

	return (
		<div className={classes.ModalContent}>
			<Typography variant="h4" gutterBottom>
				Moje jazdy
			</Typography>
			<Calendar
				slots={data ?? null}
				allowAlter={false}
				isPickMode={false}
				onDateChange={setSelectedDay}
				loading={isFetching}
				slotTitleFactory={slotTitleFactory}
			/>
		</div>
	);
}
