import { useQueryClient } from "@tanstack/react-query";
import { useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LogoutPortal() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	useLayoutEffect(() => {
		queryClient.invalidateQueries();
		localStorage.removeItem("token");

		navigate("/login");
	}, []);

	return <></>;
}
