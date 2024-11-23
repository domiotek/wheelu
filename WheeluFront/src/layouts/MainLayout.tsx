import { useTheme } from "@emotion/react";
import { Box, Theme, Toolbar } from "@mui/material";

import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";

import {
	Suspense,
	useContext,
	useState,
	createContext,
	useCallback,
	useEffect,
	useRef,
} from "react";

import classes from "./MainLayout.module.css";
import ElevatedHeader from "../components/ElevatedHeader/ElevatedHeader";
import { AppContext } from "../App";
import { Link, Outlet } from "react-router-dom";
import Drawer from "../components/Drawer/Drawer";
import LoadingScreen from "../components/LoadingScreen/LoadingScreen";
import { Chat, WbSunny } from "@mui/icons-material";
import ChatFlyout from "../components/ChatFlyout/ChatFlyout";
import { OutsideContextNotifier } from "../modules/utils";
import { ChatHubContext } from "../components/ChatHubProvider/ChatHubProvider";
import { toast } from "react-toastify";

const SYNC_INTERVAL_MS = 120000;

interface IInternalChatContext {
	conversations: App.Models.IConversation[];
	activeConversation: string | null;
	openConversation: (id: string) => void;
	closeConversation: () => void;
	setOnReceiveMessage: (
		handler:
			| Hubs.ChatHub.IChatHub["callbacks"]["syncConversation"]
			| undefined
	) => void;
}

export const InternalChatContext = createContext<IInternalChatContext>({
	conversations: [],
	activeConversation: null as any,
	openConversation: OutsideContextNotifier,
	closeConversation: OutsideContextNotifier,
	setOnReceiveMessage: OutsideContextNotifier,
});

export const ChatContext = createContext<App.IChatContext>({
	openConversationWith: OutsideContextNotifier,
});

export default function MainLayout() {
	const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

	const [chatOpen, setChatOpen] = useState<boolean>(false);
	const [conversations, setConversations] = useState<
		App.Models.IConversation[]
	>([]);
	const [activeConversation, setActiveConversation] =
		useState<IInternalChatContext["activeConversation"]>(null);

	const onReceiveMessage =
		useRef<Hubs.ChatHub.IChatHub["callbacks"]["syncConversation"]>();
	const periodicalSyncInterval = useRef<ReturnType<typeof setInterval>>();

	const { activeThemeName: activeTheme, setTheme } = useContext(AppContext);
	const { invoke, on, off, connected } = useContext(ChatHubContext);

	const theme = useTheme() as Theme;

	const openConversationWith = useCallback(
		(user: App.Models.IShortUser) => {
			setChatOpen(true);
			invoke("CreateConversationWithTarget", user.id).then((res) => {
				if (res.isSuccess) {
					setActiveConversation(res.data!.newConversation.id);
					setConversations(res.data!.allConversations);
				} else toast.error("Nie udało się otworzyć konwersacji");
			});
		},
		[connected]
	);

	useEffect(() => {
		if (!connected) return;

		invoke("GetConversations").then(setConversations);

		const receiveMessageListener = (
			conversation: App.Models.IConversation
		) => {
			setConversations([
				conversation,
				...conversations.filter((conv) => conv.id != conversation.id),
			]);

			if (!onReceiveMessage.current) return;

			const prevConversation = conversations.find(
				(c) => c.id === conversation.id
			);

			if (
				conversation.id === activeConversation &&
				conversation.lastMessage?.id != prevConversation?.lastMessage
			)
				onReceiveMessage.current(conversation);
		};

		on("syncConversation", receiveMessageListener);

		periodicalSyncInterval.current = setInterval(
			() => invoke("GetConversations").then(setConversations),
			SYNC_INTERVAL_MS
		);

		return () => {
			off("syncConversation", receiveMessageListener);
			clearInterval(periodicalSyncInterval.current);
		};
	}, [connected, activeConversation]);

	return (
		<Box sx={{ display: "flex", position: "relative" }}>
			<Drawer open={drawerOpen} setOpen={setDrawerOpen} />

			<Box
				component="main"
				className={classes.Main}
				sx={{ flexGrow: 1, p: 3, minWidth: 0 }}
			>
				<ElevatedHeader
					sx={{ background: theme.palette.background.default }}
				>
					<Toolbar>
						<IconButton onClick={() => setDrawerOpen(!drawerOpen)}>
							<MenuIcon />
						</IconButton>
						<Link className={classes.HomeLink} to={"/home"}>
							<img src="/logo.png" alt="Logo" />
						</Link>
						<IconButton
							onClick={() =>
								setTheme(
									activeTheme == "dark" ? "light" : "dark"
								)
							}
						>
							<WbSunny />
						</IconButton>
						<IconButton onClick={() => setChatOpen(!chatOpen)}>
							<Chat />
						</IconButton>
					</Toolbar>
				</ElevatedHeader>
				<ChatContext.Provider value={{ openConversationWith }}>
					<Suspense fallback={<LoadingScreen />}>
						<Outlet />
					</Suspense>
				</ChatContext.Provider>
			</Box>
			<InternalChatContext.Provider
				value={{
					conversations,
					activeConversation,
					openConversation: setActiveConversation,
					closeConversation: () => setActiveConversation(null),
					setOnReceiveMessage: (handler) =>
						(onReceiveMessage.current = handler),
				}}
			>
				<ChatFlyout open={chatOpen} />
			</InternalChatContext.Provider>
		</Box>
	);
}
