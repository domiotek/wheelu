import { useState } from "react";
import RegisterForm from "./components/RegisterForm";
import RegisterSuccess from "./components/RegisterSuccess";
import { useMutation } from "@tanstack/react-query";
import { callAPI } from "../../modules/utils";
import { API } from "../../types/api";
import RegisterPortalService from "./RegisterPortalService";

export default function RegisterPortal() {
	const [submited, setSubmited] = useState(false);

	const submitMutation = useMutation<
		null,
		API.Auth.SignUp.IEndpoint["error"],
		API.Auth.SignUp.IRequestData
	>({
		mutationFn: (data) =>
			callAPI<API.Auth.SignUp.IEndpoint>(
				"POST",
				"/api/v1/auth/signup",
				data,
				null,
				true
			),
		onSuccess: () => setSubmited(true),
	});

	return submited ? (
		<RegisterSuccess />
	) : (
		<RegisterForm
			onSubmit={(data) => {
				submitMutation.mutate({
					Username: data.email,
					Password: data.password,
					Name: data.name,
					Surname: data.surname,
					Birthday: data.birthday,
				});
			}}
			errorMessage={
				submitMutation.error
					? RegisterPortalService.translateErrorCode(
							submitMutation.error.code
					  )
					: undefined
			}
			disabled={submitMutation.isPending}
		/>
	);
}
