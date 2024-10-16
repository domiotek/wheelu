import React, { useContext, useLayoutEffect, useMemo } from "react";
import { ModalContext } from "../../components/ModalContainer/ModalContainer";
import classes from "./ScheduleModal.module.css";
import { Typography } from "@mui/material";
import Calendar from "./components/Calendar/Calendar";
import { QueryKey, useQuery } from "@tanstack/react-query";
import { API } from "../../types/api";
import { callAPI } from "../../modules/utils";
import { App } from "../../types/app";

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

export default function ScheduleModal({
	instructorID,
	allowAlter,
	mode = "view",
	onPick,
}: IProps) {
	const { setHostClassName, closeModal } = useContext(ModalContext);

	useLayoutEffect(() => {
		setHostClassName(classes.Modal);
	}, []);

	const queryKey = useMemo(() => {
		return ["Instructors", instructorID, "Schedule"];
	}, []);

	const { data } = useQuery<
		API.Schedule.GetSlotsOfInstructor.IResponse,
		API.Schedule.GetSlotsOfInstructor.IEndpoint["error"]
	>({
		queryKey,
		queryFn: () =>
			callAPI<API.Schedule.GetSlotsOfInstructor.IEndpoint>(
				"GET",
				"/api/v1/instructors/:instructorID/schedule",
				{},
				{ instructorID }
			),
		retry: true,
		staleTime: 60000,
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
				/>
			</ScheduleContext.Provider>
		</div>
	);
}
