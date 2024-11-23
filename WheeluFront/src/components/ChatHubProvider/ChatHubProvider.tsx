import React, { ReactNode, useCallback, useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { OutsideContextNotifier } from "../../modules/utils";

export const ChatHubContext = React.createContext<
	Hubs.IContext<Hubs.ChatHub.IChatHub>
>({
	connected: false,
	established: false,
	disconnect: OutsideContextNotifier,
	invoke: OutsideContextNotifier as any,
	on: OutsideContextNotifier,
	off: OutsideContextNotifier,
});

interface IProps {
	children?: ReactNode;
}

export default function ChatHubProvider({ children }: IProps) {
	const [connected, setConnected] = useState<boolean>(false);
	const [established, setEstablished] = useState<boolean>(false);

	const [connection, setConnection] = useState<signalR.HubConnection | null>(
		null
	);

	useEffect(() => {
		const newConn = new signalR.HubConnectionBuilder()
			.withUrl("https://localhost:9090/hubs/v1/chat", {
				accessTokenFactory: () => localStorage.getItem("token") ?? "",
			})
			.withAutomaticReconnect({
				nextRetryDelayInMilliseconds: () => 5000,
			})
			.build();

		setConnection(newConn);
	}, []);

	useEffect(() => {
		if (!connection) return;

		connection.onclose(() => setConnected(false));
		connection.onreconnecting(() => setConnected(false));
		connection.onreconnected(() => setConnected(true));

		connection
			.start()
			.then(() => {
				setEstablished(true);
				setConnected(true);
			})
			.catch((err) => console.log(err));

		return () => {
			connection.stop();
		};
	}, [connection]);

	const invoker = useCallback(
		(method: string, ...args: any) => {
			if (!connection)
				throw new Error(
					"Attempting to invoke on a closed hub connection."
				);

			return connection.invoke(method, ...args);
		},
		[connection]
	);

	const eventBinder = useCallback(
		(event: string, callback: (args: any) => void) => {
			if (!connection)
				throw new Error(
					"Attempting to bind event to a closed hub connection."
				);

			connection.on(event, callback);
		},
		[connection]
	);

	const eventUnBinder = useCallback(
		(event: string, callback: (args: any) => void) => {
			if (!connection)
				throw new Error(
					"Attempting to unbind event to a closed hub connection."
				);

			connection.off(event, callback);
		},
		[connection]
	);

	const disconnector = useCallback(() => {
		if (!connection)
			throw new Error(
				"Attempting to disconnect from a closed hub connection."
			);

		connection.stop();
	}, [connection]);

	return (
		<ChatHubContext.Provider
			value={{
				connected,
				established,
				invoke: invoker,
				on: eventBinder,
				off: eventUnBinder,
				disconnect: disconnector,
			}}
		>
			{children}
		</ChatHubContext.Provider>
	);
}
