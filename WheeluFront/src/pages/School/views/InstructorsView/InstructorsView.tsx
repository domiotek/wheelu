import { Button, Divider, List, Typography } from "@mui/material";
import commonClasses from "../Common.module.css";
import { useQuery } from "@tanstack/react-query";
import { API } from "../../../../types/api";
import { callAPI } from "../../../../modules/utils";
import { useContext } from "react";
import { PublicSchooPageContext } from "../../SchoolPage";
import LoadingScreen from "../../../../components/LoadingScreen/LoadingScreen";
import MessagePanel from "../../../../components/MessagePanel/MessagePanel";
import InstructorPanel from "../../../../components/InstructorPanel/InstructorPanel";
import { useNavigate } from "react-router-dom";

export default function InstructorsView() {
	const { schoolID } = useContext(PublicSchooPageContext);

	const navigate = useNavigate();

	const { data, isFetching } = useQuery<
		API.Instructors.GetAllOfSchool.IResponse,
		API.Instructors.GetAllOfSchool.IEndpoint["error"]
	>({
		queryKey: ["Schools", "#", schoolID, "Instructors"],
		queryFn: () =>
			callAPI<API.Instructors.GetAllOfSchool.IEndpoint>(
				"GET",
				"/api/v1/schools/:schoolID/instructors",
				null,
				{ schoolID }
			),
		retry: true,
		staleTime: 60000,
		enabled: schoolID != null,
	});

	return (
		<div className={commonClasses.ViewContainer}>
			<Typography variant="h5" gutterBottom>
				Instruktorzy
			</Typography>
			<Divider />

			{isFetching && <LoadingScreen />}

			{data?.length == 0 && !isFetching ? (
				<MessagePanel
					image="/no-results.svg"
					caption="Brak instruktorów"
				/>
			) : (
				<List>
					{data?.map((instructor) => {
						return (
							<InstructorPanel
								key={instructor.id}
								instructor={instructor}
								action={
									<Button
										variant="outlined"
										color="secondary"
										onClick={() =>
											navigate(
												`${instructor.instructor.id}/reviews`
											)
										}
									>
										Recenzje
									</Button>
								}
							/>
						);
					})}
				</List>
			)}
		</div>
	);
}
