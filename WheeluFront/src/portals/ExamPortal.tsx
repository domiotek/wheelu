import {
	Button,
	Card,
	CardContent,
	List,
	ListItem,
	ListItemText,
	Typography,
} from "@mui/material";
import ExamItemList from "../components/ExamItemList/ExamItemList";
import ButtonsBar from "../components/ButtonsBar/ButtonsBar";
import classes from "./ExamPortal.module.css";
import { ExamContext } from "./ExamPortalWrapper";
import {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import ExamPendingState from "./components/ExamPendingState";
import { useNavigate, useParams } from "react-router-dom";
import { DateTimeFormatter } from "../modules/formatters";
import AuthService from "../services/Auth";
import { DateTime } from "luxon";
import ExamKickedState from "./components/ExamKickedState";
import { Error } from "@mui/icons-material";
import { Id, toast } from "react-toastify";
import { ExamCriteriaScope, ExamCriteriumState } from "../modules/enums";
import ExamErrorState from "./components/ExamErrorState";

export default function ExamPortal() {
	const [examData, setExamData] = useState<App.Models.IExam | null>(null);
	const [seconds, setSeconds] = useState<number>(0);
	const [kicked, setKicked] = useState<boolean>(false);
	const [error, setError] = useState<
		Hubs.ExamHub.RegisterForExamTracking.IResponse["error"] | null
	>(null);
	const [disconnected, setDisconnected] = useState<boolean>(false);
	const [examState, setExamState] =
		useState<App.Models.ExamResult.IResult | null>(null);
	const [failing, setFailing] = useState<boolean>(false);
	const [actionsDisabled, setActionsDisabled] = useState<boolean>(false);

	const { connected, established, invoke, on, disconnect } =
		useContext(ExamContext);

	const reconnectToastRef = useRef<Id>("");
	const failingItemCount = useRef<number>(0);
	const params = useParams();
	const navigate = useNavigate();

	const updateCriteriumState = useCallback(
		async (group: string, id: string, state: ExamCriteriumState) => {
			if (!examState || actionsDisabled) return;

			if (!connected) {
				toast.error(
					"Nie można zmienić stanu tego kryterium, gdyż utracono połączenie z serwerem."
				);
				return;
			}
			setActionsDisabled(true);

			const result = await invoke(
				"ChangeCriteriumState",
				examData!.id,
				group == "maneuverCriteria"
					? ExamCriteriaScope.ManeuverCriteria
					: ExamCriteriaScope.DrivingCriteria,
				id,
				state
			);
			setActionsDisabled(false);

			if (!result.isSuccess) {
				toast.error("Nie udało się zmienić stanu tego kryterium.");
				return;
			}

			const prevState = examState[group][id].state as ExamCriteriumState;

			if (state == ExamCriteriumState.FailedTwice)
				failingItemCount.current += 1;
			else if (prevState == ExamCriteriumState.FailedTwice)
				failingItemCount.current -= 1;

			setFailing(failingItemCount.current > 0);

			setExamState({
				...examState,
				[group]: {
					...examState[group],
					[id]: {
						...examState[group][id],
						state,
					},
				},
			});
		},
		[examState, connected]
	);

	const endExamCallback = useCallback(async () => {
		if (!examData || !connected) return;

		setActionsDisabled(true);
		var result = await invoke("EndExam", examData!.id);
		setActionsDisabled(false);

		if (!result.isSuccess) {
			toast.error("Nie udało się zakończyć egzaminu");
			return;
		}

		navigate(`/courses/${examData.course.id}/exams`);
	}, [connected, examData]);

	useEffect(() => {
		setDisconnected(!connected);

		if (!connected) {
			if (established && !kicked)
				reconnectToastRef.current = toast.loading(
					"Próba ponownego połączenia..."
				);
			setActionsDisabled(true);
			return;
		} else {
			toast.done(reconnectToastRef.current);
			reconnectToastRef.current = "";
			setActionsDisabled(false);
		}

		invoke("RegisterForExamTracking", parseInt(params["examID"]!)).then(
			(response) => {
				if (!response?.isSuccess) {
					setError(response.error);
				}

				setExamData(response.data!);
				setExamState(response.data!.result);
			}
		);

		on("kick", () => {
			setKicked(true);
			disconnect();
		});
	}, [connected]);

	useEffect(() => {
		if (!examData) return;

		let count = 0;

		for (const group in examData.result) {
			for (const item in examData.result[group]) {
				const criterium = examData.result[group][
					item
				] as App.Models.ExamResult.IExamCriterium;
				if (criterium.state == ExamCriteriumState.FailedTwice) count++;
			}
		}

		failingItemCount.current = count;
		setFailing(count > 0);

		const interval = setInterval(() => {
			const totalSeconds = DateTime.now().diff(
				DateTime.fromISO(examData.ride.startTime),
				["seconds"]
			)["seconds"];
			setSeconds(totalSeconds);
		}, 1000);
		return () => {
			clearInterval(interval);
		};
	}, [examData]);

	const timeSpan = useMemo(() => {
		if (!examData) return "";

		let hours = Math.floor(seconds / 3600);
		let minutes = Math.floor((seconds % 3600) / 60);
		let seconds_c = Math.floor(seconds % 60);
		return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds_c
			.toString()
			.padStart(2, "0")}`;
	}, [seconds]);

	if (error) return <ExamErrorState errorType={error} />;

	if (kicked) return <ExamKickedState />;

	if (!established || !examData) return <ExamPendingState />;

	return (
		<Card className={classes.Host}>
			<CardContent className={classes.Content}>
				<Typography variant="h4">
					Egzamin
					{disconnected && (
						<Typography
							variant="overline"
							className={classes.DisconnectedMessage}
						>
							<Error color="error" />
							<span>Utracono połączenie.</span>
						</Typography>
					)}
				</Typography>

				<List>
					<ListItem divider>
						<ListItemText
							primary="Rozpoczęty"
							secondary={DateTimeFormatter.format(
								examData?.ride.startTime
							)}
						/>
					</ListItem>
					<ListItem divider>
						<ListItemText
							primary="Kursant"
							secondary={AuthService.getUserFullName(
								examData?.course.student
							)}
						/>
					</ListItem>
				</List>
				<ExamItemList
					className={classes.ItemList}
					itemGroups={examState!}
					courseCategory={examData.course.category}
					updateItemState={
						actionsDisabled ? undefined : updateCriteriumState
					}
				/>

				<ButtonsBar>
					<Typography
						variant="overline"
						color={(theme) =>
							failing
								? theme.palette.error.main
								: theme.palette.success.main
						}
					>
						{failing ? "Negatywny" : "Pozytywny"}
					</Typography>
					<span>{timeSpan}</span>
					<Button
						variant="contained"
						color="secondary"
						onClick={endExamCallback}
						disabled={actionsDisabled}
					>
						Zakończ
					</Button>
				</ButtonsBar>
			</CardContent>
		</Card>
	);
}
