import {
	MouseEvent,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import SimpleBar from "simplebar-react";
import classes from "./ModalContainer.module.css";
import useBodyScrollBlocker from "../../hooks/useBodyScrollBlocker";
import { OutsideContextNotifier as ctxNotify } from "../../modules/utils";
import { Card, CardContent } from "@mui/material";

interface IProps {
	show?: boolean;
	onClose: () => void;
	children?: JSX.Element | null;
}

export const ModalContext = createContext<App.IModalContext>({
	__root: true,
	__registerChildModal: () => false,
	closeModal: ctxNotify,
	setAllowCoverClosing: ctxNotify,
	setOnCoverCloseAttemptListener: ctxNotify,
	setHostClassName: ctxNotify,
	setRenderHost: ctxNotify,
	hostRef: null,
});

export default function ModalContainer({ show, onClose, children }: IProps) {
	const [allowCoverExit, setAllowCoverExit] = useState<boolean>(true);
	const [closingNotifier, setClosingNotifier] =
		useState<App.TModalClosingListener>(null);
	const [closingSoon, setClosingSoon] = useState<boolean>(false);
	const [hostClassName, setHostClassName] = useState<string | null>(null);
	const [renderHost, setRenderHost] = useState<boolean>(true);

	const { __root, __registerChildModal } = useContext(ModalContext);

	const hostRef = useRef<HTMLDivElement>(null);
	const childModalCallbackRef = useRef<() => void>();
	let childModalStateRef = useRef<boolean>(false);
	const myModalStateRef = useRef<boolean>(false);

	const [block, unblock] = useBodyScrollBlocker();

	const handleClosing = useCallback(() => {
		setClosingSoon(true);

		setTimeout(() => {
			setClosingSoon(false);
			onClose();

			myModalStateRef.current = false;

			if (__root) unblock();
		}, 400);
	}, [onClose]);

	const handleCoverClosing = useCallback(() => {
		if (childModalCallbackRef.current && childModalStateRef.current) {
			childModalCallbackRef.current();
			return;
		}

		if (!closingNotifier || closingNotifier()) handleClosing();
	}, [closingNotifier, handleClosing]);

	const coverClickCallback = useCallback(
		(e: MouseEvent) => {
			//Process only events that target 'cover' element.
			if (
				(e.target as HTMLElement).classList.contains(classes.Container)
			) {
				if (!allowCoverExit) return;

				e.stopPropagation();
				handleCoverClosing();
			}
		},
		[allowCoverExit, handleCoverClosing]
	);

	useEffect(() => {
		if (children == null) {
			setRenderHost(true);
			setHostClassName(null);
			setAllowCoverExit(true);
			setClosingNotifier(null);
		}

		if (show) {
			block();
			myModalStateRef.current = true;

			(
				hostRef.current?.querySelector(
					".simplebar-content-wrapper"
				) as HTMLElement | null
			)?.focus();
		}
	}, [show, children]);

	useLayoutEffect(() => {
		if (!__root)
			__registerChildModal({
				shown: myModalStateRef,
				closeMe: () => allowCoverExit && handleCoverClosing(),
			});
	}, [allowCoverExit, handleCoverClosing]);

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
							__root: false,
							__registerChildModal: (modal) => {
								childModalCallbackRef.current = modal.closeMe;
								childModalStateRef = modal.shown;
							},
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
