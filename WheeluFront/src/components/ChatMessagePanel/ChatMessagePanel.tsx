import React, { RefObject, useEffect, useRef } from "react";
import classes from "./ChatMessagePanel.module.css";
import { Paper, Tooltip } from "@mui/material";
import { c } from "../../modules/utils";
import { DateTimeFormatter } from "../../modules/formatters";
import useInView from "../../hooks/useInView";

interface IProps {
	root?: RefObject<Element>;
	perspective: "my" | "their";
	message: App.Models.IChatMessage;
	wasRead: boolean;
	onRead?: (message: App.Models.IChatMessage) => void;
}

export default React.memo<IProps>(function ChatMessagePanel({
	root,
	message,
	perspective,
	wasRead,
	onRead,
}) {
	const readEmitted = useRef<boolean>(wasRead);
	const ref = useRef(null);

	const isInView = useInView(ref, {
		root: root?.current,
		enabled: !readEmitted.current,
	});

	useEffect(() => {
		if (!onRead || readEmitted.current) return;

		if (isInView) {
			readEmitted.current = true;
			onRead(message);
		}
	}, [onRead, isInView]);

	return (
		<Tooltip
			title={DateTimeFormatter.format(
				message.created,
				"dd/LL/yyyy HH:mm"
			)}
			placement="top"
			enterDelay={700}
		>
			<Paper
				ref={ref}
				className={c([
					classes.Message,
					[classes.My, perspective == "my"],
				])}
			>
				{message.message}
			</Paper>
		</Tooltip>
	);
});
