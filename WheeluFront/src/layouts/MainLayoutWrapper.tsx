import ChatHubProvider from "../components/ChatHubProvider/ChatHubProvider";
import MainLayout from "./MainLayout";

export default function MainLayoutWrapper() {
	return (
		<ChatHubProvider>
			<MainLayout />
		</ChatHubProvider>
	);
}
