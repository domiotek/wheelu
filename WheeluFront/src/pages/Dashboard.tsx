import { useContext, useLayoutEffect } from "react";
import { AppContext } from "../App";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
	const { userDetails } = useContext(AppContext);

	const navigate = useNavigate();

	useLayoutEffect(() => {
		switch (userDetails?.role) {
			case "Administrator":
				navigate("/panel");
				break;
			case "SchoolManager":
				navigate(`/schools/${userDetails.ownedSchool?.id}/manage`);
		}
	}, [userDetails]);

	return <></>;
}
