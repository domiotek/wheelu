import { useCallback, useEffect, useMemo, useState } from "react";
import RegisterForm from "./components/RegisterForm";
import { useMutation, useQuery } from "@tanstack/react-query";
import { callAPI, translateGenericErrorCodes } from "../../modules/utils";
import { API } from "../../types/api";
import RegisterInstructorSuccess from "./components/RegisterInstructorSuccess";
import InvalidPortalAction from "../components/InvalidPortalAction";
import PendingPortalAction from "../components/PendingPortalAction";
import RegisterPortalService from "./RegisterPortalService";

export default function RegisterInstructorPortal() {
	const [requestState, setRequestState] = useState<
		"success" | "invalid" | "ready" | "pending"
	>("pending");
	const [token, setToken] = useState<string | null>(null);

	const tokenPresent = useCallback(() => token != null, [token]);

	const { data: tokenData, error } = useQuery<
		API.Instructors.Invities.Get.IResponse,
		API.Instructors.Invities.Get.IEndpoint["error"]
	>({
		queryKey: ["Instructors", "Invites", token],
		queryFn: () =>
			callAPI<API.Instructors.Invities.Get.IEndpoint>(
				"GET",
				"/api/v1/instructors/invites/:tokenID",
				null,
				{ tokenID: token! },
				true
			),
		staleTime: Infinity,
		enabled: tokenPresent,
	});

	const submitMutation = useMutation<
		null,
		API.Instructors.CreateAccount.IEndpoint["error"],
		API.Instructors.CreateAccount.IRequest
	>({
		mutationFn: (data) =>
			callAPI<API.Instructors.CreateAccount.IEndpoint>(
				"POST",
				"/api/v1/instructors",
				data,
				null,
				true
			),
		onSuccess: () => setRequestState("success"),
	});

	const errorMessage = useMemo(() => {
		if (!submitMutation.error) return;

		switch (submitMutation.error.code) {
			case "AccountCreationError":
				return RegisterPortalService.translateErrorCode(
					submitMutation.error
						.details[0] as API.Auth.SignUp.IEndpoint["errCodes"]
				);
			case "JoinSchoolError":
				return "Wystąpił nieoczekiwany błąd z zaproszeniem.";
			case "InvalidToken":
				return "Link stracił ważność. Poproś właściciela szkoły o wysłanie kolejnego zaproszenia.";
			default:
				return translateGenericErrorCodes(submitMutation.error.code);
		}
	}, [submitMutation.error]);

	useEffect(() => {
		const params = new URLSearchParams(location.search);

		const token = params.get("token");

		if (token) {
			setToken(token);
		} else setRequestState("invalid");
	}, []);

	useEffect(() => {
		if (tokenData) setRequestState("ready");
		if (error) setRequestState("invalid");
	}, [tokenData, error]);

	switch (requestState) {
		case "pending":
			return <PendingPortalAction />;
		case "ready":
			return (
				<RegisterForm
					headline="Utwórz konto instruktora"
					disableLoginLink={true}
					onSubmit={(data) => {
						submitMutation.mutate({
							Username: tokenData!.email,
							Password: data.password,
							Name: data.name,
							Surname: data.surname,
							Birthday: data.birthday,
							Token: token!,
						});
					}}
					errorMessage={errorMessage}
					disabled={submitMutation.isPending}
					enforceEmail={tokenData?.email}
				/>
			);
		case "invalid":
			return <InvalidPortalAction />;
		case "success":
			return <RegisterInstructorSuccess />;
	}
}
