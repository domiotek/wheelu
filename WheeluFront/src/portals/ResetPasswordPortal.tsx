import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import SuccessPortalAction from "./components/SuccessPortalAction";
import ChangePasswordPortal from "./components/ChangePasswordPortal";
import RecoverAccountPortal from "./components/RecoverAccountPortal";

export default function ResetPasswordPortal() {
	const [viewState, setViewState] = useState<"entry" | "entry-success" | "action" | "action-success" >();
	const [token, setToken] = useState<string | null>(null);
	const location = useLocation();

	useEffect(()=>{
		const params = new URLSearchParams(location.search);

		const token = params.get("token");
		setToken(token);
		setViewState(token?"action":"entry");
	},[]);

	switch(viewState) {
		case "entry": return <RecoverAccountPortal onSuccess={()=>setViewState("entry-success")}/>;
		case "entry-success": return <SuccessPortalAction message="Poszło! Sprawdź skrzynkę." link="/"/>
		case "action": return <ChangePasswordPortal onSuccess={()=>setViewState("action-success")} token={token!}/>
		case "action-success": return <SuccessPortalAction message="Twoje hasło zostało pomyślnie zmienione 🎉" link="/login"/>;
	}
}
