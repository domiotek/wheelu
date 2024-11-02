import { useContext, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../App";

export default function LogoutPortal() {
	const { destroySession } = useContext(AppContext);
	const navigate = useNavigate();

	useLayoutEffect(() => {
		destroySession();
		navigate("/login");
	}, []);

	return <></>;
}
