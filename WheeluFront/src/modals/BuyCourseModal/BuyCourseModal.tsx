import {
	useCallback,
	useContext,
	useLayoutEffect,
	useMemo,
	useState,
} from "react";
import { ModalContext } from "../../components/ModalContainer/ModalContainer";
import classes from "./BuyCourseModal.module.css";
import {
	Alert,
	AlertTitle,
	Button,
	Collapse,
	Step,
	StepLabel,
	Stepper,
	Toolbar,
	Typography,
	useMediaQuery,
} from "@mui/material";
import { AppContext } from "../../App";
import ElevatedHeader from "../../components/ElevatedHeader/ElevatedHeader";
import PersonalizeView from "./views/PersonalizeView";
import CartView from "./views/CartView";
import { App } from "../../types/app";
import { useMutation } from "@tanstack/react-query";
import { callAPI } from "../../modules/utils";
import { API } from "../../types/api";

interface IProps {
	offer: App.Models.ICourseOffer;
}

export default function BuyCourseModal({ offer }: IProps) {
	const [activeStep, setActiveStep] = useState<number>(0);
	const [instructorID, setInstructorID] = useState<number | null>(null);

	const { activeTheme } = useContext(AppContext);
	const { setHostClassName, hostRef, closeModal } = useContext(ModalContext);
	const isDesktop = useMediaQuery("(min-width: 400px)");

	const submitMutation = useMutation<
		API.Courses.Buy.IResponse,
		API.Courses.Buy.IEndpoint["error"],
		{ id: number; instructorID: number }
	>({
		mutationFn: (data) =>
			callAPI<API.Courses.Buy.IEndpoint>(
				"POST",
				"/api/v1/offers/:offerID/purchase",
				{ instructorID: data.instructorID, totalAmount: offer.price },
				{ offerID: data.id }
			),
		onSuccess: (data) => {
			window.location.assign(data.paymentUrl);
		},
	});

	const selectedInstructor = useMemo(() => {
		return offer.instructors.find((i) => i.id == instructorID)?.instructor
			.user;
	}, [instructorID]);

	const nextDisabledFlag = useMemo(() => {
		switch (activeStep) {
			case 0:
				return instructorID == null;
		}
		return false;
	}, [activeStep, instructorID]);

	const prevActionCallback = useCallback(() => {
		if (activeStep == 0) {
			closeModal();
			return;
		}

		setActiveStep(activeStep - 1);
	}, [activeStep]);

	const nextActionCallback = useCallback(() => {
		if (activeStep == 1) {
			submitMutation.mutate({
				id: offer.id,
				instructorID: instructorID!,
			});
			return;
		}

		setActiveStep(activeStep + 1);
	}, [activeStep]);

	useLayoutEffect(() => {
		setHostClassName(classes.Modal);
	}, []);

	return (
		<div className={classes.ModalContent}>
			<ElevatedHeader
				sx={{ background: activeTheme.palette.background.default }}
				elevation={2}
				scrollerRef={
					hostRef?.querySelector(".simplebar-content-wrapper") ??
					undefined
				}
			>
				<Toolbar>
					<Typography
						variant="h5"
						sx={{
							background: activeTheme.palette.background.default,
						}}
					>
						Zakup kurs
					</Typography>
				</Toolbar>
			</ElevatedHeader>

			<Stepper
				activeStep={activeStep}
				orientation={isDesktop ? "horizontal" : "vertical"}
			>
				<Step>
					<StepLabel>Dostosuj</StepLabel>
				</Step>
				<Step>
					<StepLabel>Zapłać</StepLabel>
				</Step>
			</Stepper>

			<div className={classes.ViewContainer}>
				{activeStep == 0 ? (
					<PersonalizeView
						course={offer}
						selectedInstructorId={instructorID}
						updateSelectedInstructorId={setInstructorID}
					/>
				) : (
					<CartView
						course={offer}
						selectedInstructor={selectedInstructor!}
					/>
				)}
			</div>
			<Collapse
				in={submitMutation.isError}
				className={classes.ErrorPanel}
			>
				<Alert severity="error">
					<AlertTitle>Coś poszło nie tak</AlertTitle>
					Spróbuj odświeżyć stronę.
				</Alert>
			</Collapse>

			<div className={classes.ButtonsBar}>
				<Button onClick={prevActionCallback}>
					{activeStep == 0 ? "Anuluj" : "Wróć"}
				</Button>
				<Button
					variant="contained"
					disabled={
						nextDisabledFlag ||
						submitMutation.isPending ||
						submitMutation.isSuccess
					}
					onClick={nextActionCallback}
				>
					{activeStep == 1 ? "Zakup" : "Dalej"}
				</Button>
			</div>
		</div>
	);
}
