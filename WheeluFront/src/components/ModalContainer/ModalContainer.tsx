import {
	MouseEvent,
	createContext,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import SimpleBar from "simplebar-react";
import classes from "./ModalContainer.module.css";
import useBodyScrollBlocker from "../../hooks/useBodyScrollBlocker";
import { App } from "../../types/app";
import { OutsideContextNotifier as ctxNotify } from "../../modules/utils";
import { Card, CardContent } from "@mui/material";

interface IProps {
	show?: boolean;
	onClose: () => void;
	children?: JSX.Element | null;
}

export const ModalContext = createContext<App.IModalContext>({
	closeModal: ctxNotify,
	setAllowCoverClosing: ctxNotify,
	setOnCoverCloseAttemptListener: ctxNotify,
	setHostClassName: ctxNotify,
	setRenderHost: ctxNotify,
	hostRef: null,
});

let ModalsOpened = 0;

export default function ModalContainer({ show, onClose, children }: IProps) {
	const [allowCoverExit, setAllowCoverExit] = useState<boolean>(true);
	const [closingNotifier, setClosingNotifier] =
		useState<App.TModalClosingListener>(null);
	const [closingSoon, setClosingSoon] = useState<boolean>(false);
	const [hostClassName, setHostClassName] = useState<string | null>(null);
	const [renderHost, setRenderHost] = useState<boolean>(true);

	const hostRef = useRef<HTMLDivElement>(null);

	const [block, unblock] = useBodyScrollBlocker();

	if (show) block();
	else if (ModalsOpened == 0) unblock();

	const handleClosing = useCallback(() => {
		setClosingSoon(true);
		setTimeout(() => {
			setClosingSoon(false);
			onClose();
			ModalsOpened--;
		}, 400);
	}, [onClose]);

	const coverClickCallback = useCallback(
		(e: MouseEvent) => {
			//Process only events that target 'cover' element.
			if (
				(e.target as HTMLElement).classList.contains(classes.Container)
			) {
				if (allowCoverExit) {
					e.stopPropagation();
					if (!closingNotifier || closingNotifier()) handleClosing();
				}
			}
		},
		[allowCoverExit, closingNotifier]
	);

	useEffect(() => {
		if (children == null) {
			setRenderHost(true);
			setHostClassName(null);
			setAllowCoverExit(true);
			setClosingNotifier(null);
		}

		if (show) {
			ModalsOpened++;

			(
				hostRef.current?.querySelector(
					".simplebar-content-wrapper"
				) as HTMLElement | null
			)?.focus();
		}
	}, [show, children]);

	return (
		<div
			className={`${classes.Container} ${
				show && children ? classes.Shown : ""
			} ${show && closingSoon ? classes.Intermediate : ""}`}
			onClick={coverClickCallback}
		>
			<div
				className={`${classes.Wrapper} ${
					hostClassName ? hostClassName : ""
				}`}
			>
				<div
					ref={hostRef}
					className={`${classes.Host} ${
						closingSoon ? classes.Intermediate : ""
					}`}
					tabIndex={0}
				>
					<ModalContext.Provider
						value={{
							closeModal: handleClosing,
							setOnCoverCloseAttemptListener: (l) =>
								setClosingNotifier(() => l),
							setAllowCoverClosing: setAllowCoverExit,
							setHostClassName,
							setRenderHost,
							hostRef: hostRef.current,
						}}
					>
						{renderHost ? (
							<Card className={classes.RenderedHost}>
								<SimpleBar style={{ width: "100%" }}>
									<CardContent
										className={classes.HostContent}
									>
										{children}
									</CardContent>
								</SimpleBar>
							</Card>
						) : (
							children
						)}
					</ModalContext.Provider>
				</div>
			</div>
		</div>
	);
}
