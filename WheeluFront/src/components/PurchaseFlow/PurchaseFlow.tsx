import {
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { AppContext } from "../../App";
import { ModalContext } from "../ModalContainer/ModalContainer";
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

import classes from "./PurchaseFlow.module.css";
import ElevatedHeader from "../ElevatedHeader/ElevatedHeader";
import CartView from "./components/CartView";
import ButtonsBar from "../ButtonsBar/ButtonsBar";
import { Id, toast } from "react-toastify";

interface IProps {
	className?: string;
	header: string;
	steps: App.UI.PurchaseFlow.IStepDef[];
	cartItems: App.UI.PurchaseFlow.ICartItemDef[];
	onCanGoNext: (step: number) => boolean;
	onPurchaseAttempt: () => void;
	isError: boolean;
	isMutationPending: boolean;
}

export default function PurchaseFlow({
	className,
	header,
	steps,
	cartItems,
	isError,
	isMutationPending,
	onCanGoNext,
	onPurchaseAttempt,
}: IProps) {
	const [activeStep, setActiveStep] = useState<number>(0);

	const { activeTheme } = useContext(AppContext);
	const { setHostClassName, hostRef, closeModal } = useContext(ModalContext);
	const isDesktop = useMediaQuery("(min-width: 400px)");

	const processingToastRef = useRef<Id | undefined>();

	const nextDisabledFlag = useMemo(() => {
		return !onCanGoNext(activeStep) || isMutationPending;
	}, [activeStep, isMutationPending, onCanGoNext]);

	const prevActionCallback = useCallback(() => {
		if (activeStep == 0) {
			closeModal();
			return;
		}

		setActiveStep(activeStep - 1);
	}, [activeStep]);

	const nextActionCallback = useCallback(() => {
		if (activeStep == steps.length) {
			onPurchaseAttempt();
			return;
		}

		setActiveStep(activeStep + 1);
	}, [activeStep, onPurchaseAttempt]);

	useEffect(() => {
		if (isMutationPending && processingToastRef.current == undefined) {
			processingToastRef.current = toast.loading(
				"Przetwarzamy Twoje żądanie..."
			);
		}

		if (!isMutationPending) {
			toast.done(processingToastRef.current!);

			if (!isError && processingToastRef.current) {
				toast.info("Przekierowujemy Cię na stronę płatności...");
			}

			processingToastRef.current = undefined;
		}
	}, [isMutationPending]);

	useLayoutEffect(() => {
		setHostClassName(className ?? classes.Modal);
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
						{header}
					</Typography>
				</Toolbar>
			</ElevatedHeader>

			<Stepper
				activeStep={activeStep}
				orientation={isDesktop ? "horizontal" : "vertical"}
			>
				{steps.map((step) => (
					<Step key={step.name}>
						<StepLabel>{step.name}</StepLabel>
					</Step>
				))}
				<Step>
					<StepLabel>Zapłać</StepLabel>
				</Step>
			</Stepper>

			<div className={classes.ViewContainer}>
				{activeStep <= steps.length - 1 ? (
					steps[activeStep].view
				) : (
					<CartView items={cartItems} />
				)}
			</div>
			<Collapse in={isError} className={classes.ErrorPanel}>
				<Alert severity="error">
					<AlertTitle>Coś poszło nie tak</AlertTitle>
					Spróbuj odświeżyć stronę.
				</Alert>
			</Collapse>

			<ButtonsBar>
				<Button onClick={prevActionCallback}>
					{activeStep == 0 ? "Anuluj" : "Wróć"}
				</Button>
				<Button
					variant="contained"
					disabled={nextDisabledFlag}
					onClick={nextActionCallback}
				>
					{activeStep == steps.length ? "Zakup" : "Dalej"}
				</Button>
			</ButtonsBar>
		</div>
	);
}
