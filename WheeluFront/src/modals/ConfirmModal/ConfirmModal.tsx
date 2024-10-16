import { useCallback, useContext, useLayoutEffect } from "react";
import { ModalContext } from "../../components/ModalContainer/ModalContainer";
import classes from "./ConfirmModal.module.css";
import { Button, Typography } from "@mui/material";
import ButtonsBar from "../../components/ButtonsBar/ButtonsBar";

interface IProps {
	header: string;
	message: string;
	cancelButtonCaption?: string;
	confirmButtonCaption?: string;
	onDecision: (confirmed: boolean) => void;
}

export default function ConfirmModal({
	header,
	message,
	cancelButtonCaption,
	confirmButtonCaption,
	onDecision,
}: IProps) {
	const { setHostClassName, closeModal, setOnCoverCloseAttemptListener } =
		useContext(ModalContext);

	useLayoutEffect(() => {
		setHostClassName(classes.Modal);
		setOnCoverCloseAttemptListener(() => {
			onDecision(false);
			return true;
		});
	}, [onDecision]);

	const passDecision = useCallback(
		function (this: boolean) {
			onDecision(this);
			closeModal();
		},
		[onDecision]
	);

	return (
		<div className={classes.Content}>
			<Typography variant="h5">{header}</Typography>
			<Typography variant="body2">{message}</Typography>
			<ButtonsBar>
				<Button onClick={passDecision.bind(false)}>
					{cancelButtonCaption ?? "Anuluj"}
				</Button>
				<Button variant="contained" onClick={passDecision.bind(true)}>
					{confirmButtonCaption ?? "Potwierdź"}
				</Button>
			</ButtonsBar>
		</div>
	);
}
