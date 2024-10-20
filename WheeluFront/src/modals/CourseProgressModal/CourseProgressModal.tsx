import {
	Button,
	Checkbox,
	FormControlLabel,
	TextField,
	Typography,
} from "@mui/material";
import { App } from "../../types/app";
import {
	useCallback,
	useContext,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { ModalContext } from "../../components/ModalContainer/ModalContainer";
import classes from "./CourseProgressModal.module.css";
import SimpleBar from "simplebar-react";
import ButtonsBar from "../../components/ButtonsBar/ButtonsBar";
import { SkillLevel } from "../../modules/enums";
import SkillGroup from "./components/SkillGroup";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { callAPI } from "../../modules/utils";
import { API } from "../../types/api";
import { toast } from "react-toastify";

interface IProps {
	courseID: number;
	queryKey: QueryKey;
	progressInfo: App.Models.ICourseProgress;
	editAllowed: boolean;
}

export default function CourseProgressModal({
	courseID,
	queryKey,
	progressInfo,
	editAllowed,
}: IProps) {
	const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
	const [hideMastered, setHideMastered] = useState<boolean>(false);
	const [query, setQuery] = useState<string>("");
	const [commitedQuery, setCommittedQuery] = useState<string>("");
	const [renderCounter, setRenderCounter] = useState<number>(0);

	const queryDeferTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined
	);

	const progressCache =
		useRef<Record<string, Record<string, SkillLevel>>>(progressInfo);

	const { setHostClassName, closeModal } = useContext(ModalContext);

	const qClient = useQueryClient();

	const updateProgressMutation = useMutation<
		null,
		API.Courses.UpdateProgress.IEndpoint["error"],
		API.Courses.UpdateProgress.IRequest
	>({
		mutationFn: (data) =>
			callAPI<API.Courses.UpdateProgress.IEndpoint>(
				"PUT",
				"/api/v1/courses/:courseID/progress",
				data,
				{ courseID }
			),
		onSuccess: () => {
			qClient.invalidateQueries({ queryKey });
			closeModal();
			toast.success("Poprawnie zaktualizowano postęp.");
		},
		onError: () => toast.error("Nie udało się zaktualizować postępu."),
	});

	const updateSkillLevel = useCallback(
		(group: string, id: string, skill: SkillLevel) => {
			progressCache.current = {
				...progressCache.current,
				[group]: {
					...progressCache.current[group],
					[id]: skill,
				},
			};
			setRenderCounter(renderCounter + 1);
		},
		[renderCounter]
	);

	const updateQueryCallback = (newQuery: string) => {
		setQuery(newQuery);
		clearTimeout(queryDeferTimeout.current);

		queryDeferTimeout.current = setTimeout(() => {
			if (query !== newQuery) setCommittedQuery(newQuery);
		}, 700);
	};

	const updateProgressCallback = useCallback(() => {
		updateProgressMutation.mutate({
			progress: progressCache.current as App.Models.ICourseProgress,
		});
	}, []);

	useLayoutEffect(() => {
		setHostClassName(classes.Modal);
	}, []);

	return (
		<div className={classes.Host}>
			<Typography variant="h5">Postęp w kursie</Typography>

			<div className={classes.Content}>
				<div className={classes.FilterBox}>
					<TextField
						label="Wyszukaj"
						size="small"
						value={query}
						onChange={(ev) => updateQueryCallback(ev.target.value)}
					/>
					<FormControlLabel
						control={
							<Checkbox
								value={hideMastered}
								onChange={(_ev, val) => setHideMastered(val)}
							/>
						}
						label="Ukryj opanowane"
					/>
				</div>
				<SimpleBar className={classes.ScrollBox}>
					{Object.keys(progressCache.current).map((group) => {
						const skillSet = progressCache.current[group];

						return (
							<SkillGroup
								key={group}
								groupID={group}
								expanded={expandedGroup == group}
								setExpanded={(state) =>
									setExpandedGroup(state ? group : null)
								}
								skills={skillSet}
								filterMastered={hideMastered}
								filterQuery={commitedQuery}
								onChange={
									editAllowed ? updateSkillLevel : undefined
								}
							/>
						);
					})}
				</SimpleBar>
			</div>
			<ButtonsBar>
				<Button
					variant={editAllowed ? "text" : "contained"}
					onClick={closeModal}
				>
					{editAllowed ? "Anuluj" : "Ok"}
				</Button>
				{editAllowed && (
					<Button
						variant="contained"
						onClick={updateProgressCallback}
					>
						Zapisz
					</Button>
				)}
			</ButtonsBar>
		</div>
	);
}
