import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { callAPI } from "../modules/utils";
import { API } from "../types/api";
import PendingPortalAction from "./components/PendingPortalAction";
import InvalidPortalAction from "./components/InvalidPortalAction";
import FailurePortalAction from "./components/FailurePortalAction";
import SuccessPortalAction from "./components/SuccessPortalAction";

export default function ActivateAccountPortal() {
	const [requestState, setRequestState] = useState<"success" | "invalid" | "failure" | "pending">("pending");
	const location = useLocation();

	const activationMutation = useMutation<null, API.Auth.ActivateAccount.IEndpoint["error"], API.Auth.ActivateAccount.IRequestData>({
        mutationFn: data=>callAPI<API.Auth.ActivateAccount.IEndpoint>("POST","/api/v1/auth/activate-account",data, null, true),
        onSuccess: ()=>setRequestState("success"),
		onError: (()=>setRequestState("failure"))
    });

	useEffect(()=>{
		const params = new URLSearchParams(location.search);

		const token = params.get("token");

		if(token) {
			const id = setTimeout(()=>activationMutation.mutate({Token: token}), 100);
			return ()=>clearTimeout(id);
		}else setRequestState("invalid");
	},[]);

	switch(requestState) {
		case "pending": return <PendingPortalAction />;
		case "invalid": return <InvalidPortalAction />;
		case "failure": return <FailurePortalAction message="Nie udało się aktywować konta. Być może link już wygasł?"/>;
		case "success": return <SuccessPortalAction message="Twoje konto jest już aktywne - możesz się zalogować 🎉" link="/login"/>;
	}
}
