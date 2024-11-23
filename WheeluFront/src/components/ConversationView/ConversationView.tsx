import { ChevronLeft, Send } from "@mui/icons-material";
import {
	Box,
	Divider,
	IconButton,
	TextField,
	Tooltip,
	Typography,
} from "@mui/material";
import AuthService from "../../services/Auth";
import classes from "./ConversationView.module.css";
import {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { InternalChatContext } from "../../layouts/MainLayout";
import { ChatHubContext } from "../ChatHubProvider/ChatHubProvider";
import { toast } from "react-toastify";
import SimpleBar from "simplebar-react";
import ChatMessagePanel from "../ChatMessagePanel/ChatMessagePanel";
import { AppContext } from "../../App";
import { DateTime } from "luxon";
import { debounce } from "../../modules/utils";
import { DateTimeFormatter } from "../../modules/formatters";
import ChatMemberAvatar from "../ChatMemberAvatar/ChatMemberAvatar";

interface IProps {
	conversation: App.Models.IConversation;
}

export default function ConversationView({ conversation }: IProps) {
	const [messages, setMessages] = useState<App.Models.IChatMessage[]>([]);
	const [messagePrompt, setMessagePrompt] = useState<string>("");

	const simpleBarRef = useRef<HTMLDivElement>(null);

	const { closeConversation, setOnReceiveMessage } =
		useContext(InternalChatContext);
	const { invoke } = useContext(ChatHubContext);
	const { userDetails } = useContext(AppContext);

	const sendMessage = useCallback(async () => {
		const newMessage = await invoke(
			"SendMessageInConversation",
			conversation.id,
			messagePrompt
		);
		if (newMessage.isSuccess) {
			setMessages([...messages, newMessage.data!]);
			setMessagePrompt("");
		} else toast.error("Nie udało się wysłać wiadomości.");
	}, [messagePrompt]);

	useEffect(() => {
		invoke("GetConversationMessages", conversation.id).then((res) => {
			if (res.isSuccess) {
				setMessages(res.data!);
				scrollToBottom();
			} else toast.error("Nie udało się wczytać wiadomości.");
		});
	}, [conversation]);

	useEffect(() => {
		setOnReceiveMessage((conversation: App.Models.IConversation) => {
			setMessages((prevItems) => [
				...prevItems,
				conversation.lastMessage!,
			]);

			setTimeout(() => scrollToBottom(true), 0);
		});

		return () => setOnReceiveMessage(undefined);
	}, []);

	const scrollToBottom = useCallback((smooth: boolean = false) => {
		simpleBarRef.current?.scrollTo({
			top: simpleBarRef.current.scrollHeight,
			behavior: smooth ? "smooth" : "instant",
		});
	}, []);

	const wasRead = useCallback(
		(message: App.Models.IChatMessage) => {
			const lastReadMessage =
				conversation.lastReadMessages[userDetails!.userId];

			if (!lastReadMessage) return false;

			const lastRead = DateTime.fromISO(lastReadMessage.created);
			const currMessage = DateTime.fromISO(message.created);

			return currMessage <= lastRead;
		},
		[conversation]
	);

	const readMessage = useCallback(
		debounce((message: App.Models.IChatMessage) => {
			invoke("ReadMessage", conversation.id, message.id);
		}, 300),
		[conversation]
	);

	const lastSeentText = useMemo(
		() =>
			DateTimeFormatter.formatRelativeDiff(
				conversation.otherPartyLastSeen,
				["minutes", "hours"]
			),
		[conversation.otherPartyLastSeen]
	);

	return (
		<div className={classes.Host}>
			<div className={classes.Header}>
				<IconButton color="primary" onClick={closeConversation}>
					<ChevronLeft />
				</IconButton>
				<ChatMemberAvatar conversation={conversation} />
				<div className={classes.HeaderTextContent}>
					<Typography variant="h6">
						{AuthService.getUserFullName(conversation.otherParty)}
					</Typography>
					<Tooltip
						title={DateTimeFormatter.format(
							conversation.otherPartyLastSeen
						)}
					>
						<Typography variant="caption">
							{lastSeentText == ""
								? "Nieaktywny(-a)"
								: `Aktywny(-a) ${lastSeentText}`}
						</Typography>
					</Tooltip>
				</div>
			</div>
			<Divider />
			<Box
				className={classes.MessageList}
				sx={{
					"--my-message-bg-color": (theme) =>
						theme.palette.secondary.light,
					"--my-message-color": (theme) =>
						theme.palette.secondary.contrastText,
					"--their-message-bg-color": (theme) =>
						theme.palette.background.default,
				}}
			>
				<SimpleBar scrollableNodeProps={{ ref: simpleBarRef }}>
					{messages.map((message) => (
						<ChatMessagePanel
							key={message.id}
							message={message}
							perspective={
								message.author.id === userDetails?.userId
									? "my"
									: "their"
							}
							root={simpleBarRef}
							wasRead={wasRead(message)}
							onRead={readMessage}
						/>
					))}
				</SimpleBar>
			</Box>
			<Divider />
			<div className={classes.BottomControls}>
				<TextField
					size="small"
					label="Wprowadź wiadomość"
					multiline
					maxRows={3}
					value={messagePrompt}
					onChange={(e) => setMessagePrompt(e.target.value)}
				></TextField>
				<IconButton
					color="primary"
					onClick={sendMessage}
					onKeyDown={(e) => e.key == "Enter" && sendMessage()}
				>
					<Send />
				</IconButton>
			</div>
		</div>
	);
}
