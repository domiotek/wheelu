import ExamPortal from "./ExamPortal";
import React, { useCallback, useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { OutsideContextNotifier } from "../modules/utils";

export const ExamContext = React.createContext<
	Hubs.IContext<Hubs.ExamHub.IExamHub>
>({
	connected: false,
	established: false,
	disconnect: OutsideContextNotifier,
	invoke: OutsideContextNotifier as any,
	on: OutsideContextNotifier,
});

export default function ExamPortalWrapper() {
	const [connected, setConnected] = useState<boolean>(false);
	const [established, setEstablished] = useState<boolean>(false);

	const [connection, setConnection] = useState<signalR.HubConnection | null>(
		null
	);

	useEffect(() => {
		const newConn = new signalR.HubConnectionBuilder()
			.withUrl("https://localhost:9090/hubs/v1/exams", {
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

	const disconnector = useCallback(() => {
		if (!connection)
			throw new Error(
				"Attempting to disconnect from a closed hub connection."
			);

		connection.stop();
	}, [connection]);

	return (
		<ExamContext.Provider
			value={{
				connected,
				established,
				invoke: invoker,
				on: eventBinder,
				disconnect: disconnector,
			}}
		>
			<ExamPortal />
		</ExamContext.Provider>
	);
}
