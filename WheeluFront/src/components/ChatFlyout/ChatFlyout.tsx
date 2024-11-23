import { Paper, Typography } from "@mui/material";
import classes from "./ChatFlyout.module.css";
import { c } from "../../modules/utils";
import { useContext } from "react";
import { AppContext } from "../../App";
import { InternalChatContext } from "../../layouts/MainLayout";
import ConversationView from "../ConversationView/ConversationView";
import ConversationList from "../ConversationList/ConversationList";

interface IProps {
	open: boolean;
}

export default function ChatFlyout({ open }: IProps) {
	const { activeThemeName } = useContext(AppContext);
	const { activeConversation, conversations } =
		useContext(InternalChatContext);

	return (
		<Paper
			elevation={3}
			className={c([classes.Host, [classes.Open, open]])}
			sx={{
				background: (theme) =>
					activeThemeName == "dark"
						? theme.palette.grey[900]
						: theme.palette.grey[100],
			}}
		>
			<div className={classes.Header}>
				<Typography variant="h5">Czat</Typography>
			</div>

			{activeConversation ? (
				<ConversationView
					conversation={
						conversations.find((c) => c.id === activeConversation)!
					}
				/>
			) : (
				<ConversationList conversations={conversations} />
			)}
		</Paper>
	);
}
