import {
	ButtonBase,
	List,
	ListItem,
	ListItemAvatar,
	TextField,
	Typography,
} from "@mui/material";
import SimpleBar from "simplebar-react";
import AuthService from "../../services/Auth";
import classes from "./ConversationList.module.css";
import { useCallback, useContext } from "react";
import { InternalChatContext } from "../../layouts/MainLayout";
import { AppContext } from "../../App";
import InlineDot from "../InlineDot/InlineDot";
import { Check } from "@mui/icons-material";
import ChatMemberAvatar from "../ChatMemberAvatar/ChatMemberAvatar";

interface IProps {
	conversations: App.Models.IConversation[];
}

export default function ConversationList({ conversations }: IProps) {
	const { openConversation } = useContext(InternalChatContext);
	const { userDetails } = useContext(AppContext);

	const isUnreadBy = useCallback(
		(conversation: App.Models.IConversation, userId: string) => {
			const myLastRead = conversation.lastReadMessages[userId];

			return myLastRead?.id != conversation.lastMessage?.id;
		},
		[]
	);

	return (
		<>
			<div className={classes.SearchBox}>
				<TextField
					color="secondary"
					variant="filled"
					size="small"
					label="Wyszukaj konwersację"
				/>
			</div>
			<SimpleBar>
				<List className={classes.ConversationList}>
					{conversations.map((conversation) => {
						const ownUnread = isUnreadBy(
							conversation,
							userDetails!.userId
						);
						const theirUnread = isUnreadBy(
							conversation,
							conversation.otherParty.id
						);

						return (
							<ListItem
								key={conversation.id}
								className={classes.Conversation}
							>
								<ButtonBase
									onClick={() =>
										openConversation(conversation.id)
									}
								>
									<ListItemAvatar className={classes.Avatar}>
										<ChatMemberAvatar
											conversation={conversation}
										/>
									</ListItemAvatar>
									<div className={classes.ConversationText}>
										<Typography
											fontWeight={
												ownUnread ? "bold" : "normal"
											}
										>
											{AuthService.getUserFullName(
												conversation.otherParty
											)}
											{ownUnread && (
												<InlineDot color="secondary" />
											)}
										</Typography>
										<Typography variant="caption">
											{conversation.lastMessage?.author
												.id == userDetails?.userId && (
												<Check
													color={
														!theirUnread
															? "info"
															: "disabled"
													}
												/>
											)}

											{conversation.lastMessage?.message}
										</Typography>
									</div>
								</ButtonBase>
							</ListItem>
						);
					})}
					{conversations.length == 0 && (
						<Typography>Brak konwersacji</Typography>
					)}
				</List>
			</SimpleBar>
		</>
	);
}
