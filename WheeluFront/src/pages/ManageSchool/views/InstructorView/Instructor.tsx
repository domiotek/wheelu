import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ViewWrapper from "../Wrapper";
import {
	callAPI,
	popUrlSegment,
	prepareFieldErrorMessage,
} from "../../../../modules/utils";
import { API } from "../../../../types/api";
import {
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useState,
} from "react";
import { SchoolPageContext } from "../../ManageSchoolPage";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import classes from "./Instructor.module.css";
import {
	Alert,
	AlertTitle,
	Button,
	Divider,
	IconButton,
	List,
	ListItem,
	ListItemText,
	Switch,
	Tooltip,
	Typography,
} from "@mui/material";
import { CalendarMonth, Message } from "@mui/icons-material";
import CategoriesWidget from "../../../../components/CategoriesWidget/CategoriesWidget";
import { FormProvider, TextFieldElement, useForm } from "react-hook-form-mui";
import LoadingScreen from "../../../../components/LoadingScreen/LoadingScreen";
import MessagePanel from "../../../../components/MessagePanel/MessagePanel";
import { AppContext } from "../../../../App";
import { DateTime } from "luxon";
import { CourseCategory } from "../../../../modules/enums";
import InstructorService from "../../../../services/Instructor";
import InstructorScheduleModal from "../../../../modals/ScheduleModal/InstructorScheduleModal";
import { toast } from "react-toastify";
import RatingWidget from "../../../../components/RatingWidget/RatingWidget";

export default function Instructor() {
	const [visibilityState, setVisibilityState] = useState<boolean>(false);
	const [newAllowedCategories, setNewAllowedCategories] = useState<
		CourseCategory[]
	>([]);
	const [editingAllowedCategories, setEditingAllowedCategories] =
		useState<boolean>(false);

	const { schoolData, access, accessorUserID } =
		useContext(SchoolPageContext);
	const { setModalContent } = useContext(AppContext);

	const params = useParams();
	const qClient = useQueryClient();
	const navigate = useNavigate();
	const location = useLocation();

	const formContext = useForm<API.Instructors.Update.IInstructorProperties>({
		defaultValues: { maximumConcurrentStudents: 0 },
	});

	const queryKey = useMemo(
		() => [
			"Schools",
			"#",
			schoolData?.id,
			"Instructors",
			"#",
			parseInt(params["instructorId"] ?? ""),
		],
		[schoolData, params]
	);

	const queryParams = useMemo(
		() => ({
			schoolID: schoolData!.id,
			instructorID: parseInt(params["instructorId"] ?? ""),
		}),
		[schoolData, params]
	);

	const { data, isLoading, isFetching, error, failureCount } = useQuery<
		API.Instructors.Get.IResponse,
		API.Instructors.Get.IEndpoint["error"]
	>({
		queryKey,
		queryFn: () =>
			callAPI<API.Instructors.Get.IEndpoint>(
				"GET",
				"/api/v1/schools/:schoolID/instructors/:instructorID",
				null,
				queryParams
			),
		retry: true,
		staleTime: 60000,
	});

	const invalidateQueries = useCallback(() => {
		qClient.invalidateQueries({ queryKey });

		const instructorsQueryKey = [...queryKey];
		instructorsQueryKey.pop();
		qClient.invalidateQueries({ queryKey: instructorsQueryKey });
	}, [queryKey]);

	const updateMutation = useMutation<
		null,
		API.Instructors.Update.IEndpoint["error"],
		API.Instructors.Update.IRequest
	>({
		mutationFn: (data) =>
			callAPI<API.Instructors.Update.IEndpoint>(
				"PUT",
				"/api/v1/schools/:schoolID/instructors/:instructorID",
				data,
				queryParams
			),
		onSuccess: invalidateQueries,
		onError: () => toast.error("Nie udało się zapisać zmian."),
	});

	const detachMutation = useMutation<
		null,
		API.Instructors.Detach.IEndpoint["error"],
		null
	>({
		mutationFn: () =>
			callAPI<API.Instructors.Detach.IEndpoint>(
				"DELETE",
				"/api/v1/schools/:schoolID/instructors/:instructorID",
				null,
				queryParams
			),
		onSuccess: () => {
			navigate(popUrlSegment(location.pathname));
			invalidateQueries();
		},
		onError: (err) =>
			toast.error(
				"Nie udało się odłączyć profilu instruktora. " +
					InstructorService.translateDetachSubmitErrorCode(err.code)
			),
	});

	const updateVisibilityCallback = useCallback(() => {
		updateMutation.mutate({
			visibilityState: !visibilityState,
		});
	}, [visibilityState]);

	const enterAllowedCategoriesEditMode = useCallback(() => {
		setEditingAllowedCategories(true);
		setNewAllowedCategories(data?.allowedCategories ?? []);
	}, [data]);

	const saveAllowedCategoriesEditMode = useCallback(async () => {
		await updateMutation.mutateAsync({
			allowedCategories: newAllowedCategories,
		});

		setEditingAllowedCategories(false);
	}, [newAllowedCategories]);

	const cancelAllowedCategoriesEditMode = useCallback(() => {
		setEditingAllowedCategories(false);
	}, []);

	const modifyAllowedCategoriesState = useCallback(
		(category: CourseCategory) => {
			const newState = [...newAllowedCategories];

			if (newState.includes(category)) {
				newState.splice(newState.indexOf(category), 1);
			} else newState.push(category);

			setNewAllowedCategories(newState);
		},
		[newAllowedCategories]
	);

	const submitProperties = useCallback(
		(data: API.Instructors.Update.IInstructorProperties) => {
			updateMutation.mutate({
				properties: data,
			});
		},
		[]
	);

	const showScheduleModal = useCallback(() => {
		setModalContent(
			<InstructorScheduleModal
				instructorID={data?.instructor.id!}
				allowAlter={
					access == "instructor" &&
					accessorUserID == data?.instructor.user.id
				}
			/>
		);
	}, [data]);

	const disabledActionsFlag = useMemo(
		() =>
			isFetching || updateMutation.isPending || detachMutation.isPending,
		[isFetching, updateMutation.isPending, detachMutation.isPending]
	);

	useEffect(() => {
		if (!data) return;

		setVisibilityState(data.visible);

		formContext.setValue(
			"maximumConcurrentStudents",
			data.maximumConcurrentStudents
		);
	}, [data, formContext]);

	useLayoutEffect(() => {
		if (access != "owner") {
			navigate(popUrlSegment(location.pathname));
		}
	}, []);

	const activeCourses = useMemo(() => {
		return data?.assignedCourses.filter((val) => !val.archived) ?? [];
	}, [data]);

	const instructorCoursesText = useMemo(() => {
		if (!data) return "";

		return `${data.assignedCourses.length} (${activeCourses.length})`;
	}, [data]);

	if (isLoading && failureCount < 3) return <LoadingScreen />;

	if (error || !data)
		return (
			<ViewWrapper headline={"Instruktor"}>
				<MessagePanel
					className={classes.ErrorMessage}
					image="/tangled.svg"
					caption="Coś poszło nie tak"
				/>
			</ViewWrapper>
		);

	return (
		<ViewWrapper
			headline={`${data.instructor.user.name} ${data.instructor.user.surname}`}
		>
			<div className={classes.Container}>
				<section className={classes.TopSection}>
					<List>
						<ListItem divider>
							<ListItemText
								primary="Imię i nazwisko"
								secondary={`${data.instructor.user.name} ${data.instructor.user.surname}`}
							/>
							<IconButton
								color="secondary"
								onClick={showScheduleModal}
							>
								<CalendarMonth />
							</IconButton>
							<IconButton color="secondary">
								<Message />
							</IconButton>
						</ListItem>
						<ListItem divider>
							<ListItemText
								primary="Widoczność"
								secondary="Określ, czy instruktor powinien być widoczny i możliwy do wybrania przez kursantów."
							/>
							<Switch
								color="secondary"
								checked={visibilityState}
								disabled={disabledActionsFlag}
								onChange={updateVisibilityCallback}
							/>
						</ListItem>
						<ListItem divider>
							<ListItemText
								primary="Dołączono"
								secondary={DateTime.fromISO(
									data.employmentRecords[
										data.employmentRecords.length - 1
									].startTime
								).toFormat("dd/LL/yyyy")}
							/>
						</ListItem>
						<ListItem divider>
							<ListItemText
								primary="Kursy (aktywne)"
								secondary={instructorCoursesText}
							/>
							{data.assignedCourses.length > 0 && (
								<Button
									variant="outlined"
									color="secondary"
									onClick={() => navigate("courses")}
								>
									Zobacz
								</Button>
							)}
						</ListItem>
						<ListItem className={classes.RatingItem}>
							<RatingWidget
								grade={data.instructor.grade}
								reviewCount={data.instructor.reviewCount}
								readonly
							/>

							<Button
								variant="outlined"
								color="secondary"
								onClick={() =>
									navigate(
										`../instructors/${data.instructor.id}/reviews`
									)
								}
							>
								Zobacz
							</Button>
						</ListItem>
					</List>
					<div className={classes.CategoriesWidgetWrapper}>
						<div className={classes.ButtonsBar}>
							{editingAllowedCategories ? (
								<>
									<Button
										onClick={
											cancelAllowedCategoriesEditMode
										}
										disabled={disabledActionsFlag}
									>
										Anuluj
									</Button>
									<Button
										variant="contained"
										onClick={saveAllowedCategoriesEditMode}
										disabled={disabledActionsFlag}
									>
										Zapisz
									</Button>
								</>
							) : (
								<Button
									variant="outlined"
									onClick={enterAllowedCategoriesEditMode}
									disabled={disabledActionsFlag}
								>
									Edytuj
								</Button>
							)}
						</div>

						<CategoriesWidget
							enabledList={
								new Set(
									editingAllowedCategories
										? newAllowedCategories
										: data.allowedCategories
								)
							}
							onChipClick={
								editingAllowedCategories
									? modifyAllowedCategoriesState
									: undefined
							}
						/>
					</div>
				</section>
				<section>
					<Typography variant="h5">Właściwości</Typography>
					<Divider />
					<FormProvider {...formContext}>
						<form
							className={classes.PropertiesForm}
							onSubmit={formContext.handleSubmit(
								submitProperties
							)}
						>
							<TextFieldElement
								name="maximumConcurrentStudents"
								type="number"
								label="Maksymalna ilość przypisanych kursantów"
								color="secondary"
								required
								rules={{ min: 0 }}
								parseError={prepareFieldErrorMessage}
							/>
							<div className={classes.ButtonsBar}>
								<Button
									type="submit"
									variant="outlined"
									disabled={disabledActionsFlag}
								>
									Zapisz
								</Button>
							</div>
						</form>
					</FormProvider>
				</section>
				<section className={classes.DetachSection}>
					<Typography variant="h5">Odłącz instruktora</Typography>
					{activeCourses.length > 0 && (
						<Alert severity="warning">
							<AlertTitle>Akcja zablokowana</AlertTitle>
							Instruktor nadal ma przypisane kursy.
						</Alert>
					)}

					<Typography>
						Odłączony instruktor zostanie usunięty ze szkoły jazdy.
					</Typography>
					<Tooltip
						title="Instruktor musi być ukryty."
						disableHoverListener={!data.visible}
						disableFocusListener={!data.visible}
					>
						<span className={classes.DetachButtonWrapper}>
							<Button
								color="error"
								variant="contained"
								disabled={
									disabledActionsFlag ||
									data.visible ||
									activeCourses.length > 0
								}
								onClick={() => detachMutation.mutate(null)}
							>
								Odłącz
							</Button>
						</span>
					</Tooltip>
				</section>
			</div>
		</ViewWrapper>
	);
}
