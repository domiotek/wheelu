import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { callAPI } from "../modules/utils";
import { API } from "../types/api";
import PendingPortalAction from "./components/PendingPortalAction";
import InvalidPortalAction from "./components/InvalidPortalAction";
import FailurePortalAction from "./components/FailurePortalAction";
import SuccessPortalAction from "./components/SuccessPortalAction";

export default function JoinSchoolPortal() {
	const [requestState, setRequestState] = useState<
		"success" | "invalid" | "failure" | "pending"
	>("pending");
	const location = useLocation();

	const joinMutation = useMutation<
		null,
		API.Instructors.ConnectProfile.IEndpoint["error"],
		API.Instructors.ConnectProfile.IRequest
	>({
		mutationFn: (data) =>
			callAPI<API.Instructors.ConnectProfile.IEndpoint>(
				"POST",
				"/api/v1/instructors/join",
				data,
				null,
				true
			),
		onSuccess: () => setRequestState("success"),
		onError: () => setRequestState("failure"),
	});

	useEffect(() => {
		const params = new URLSearchParams(location.search);

		const token = params.get("token");

		if (token) {
			const id = setTimeout(
				() => joinMutation.mutate({ Token: token }),
				100
			);
			return () => clearTimeout(id);
		} else setRequestState("invalid");
	}, []);

	switch (requestState) {
		case "pending":
			return <PendingPortalAction />;
		case "invalid":
			return <InvalidPortalAction />;
		case "failure":
			return (
				<FailurePortalAction message="Nie udało się połączyć Twojego konta ze szkołą jazdy. Być może link już wygasł?" />
			);
		case "success":
			return (
				<SuccessPortalAction
					message="Twój profil został połączony ze szkołą jazdy 🎉"
					link="/home"
				/>
			);
	}
}
