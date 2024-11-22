import { Divider, List, Typography } from "@mui/material";
import classes from "./InstructorReviewsView.module.css";
import commonClasses from "../Common.module.css";
import { useQuery } from "@tanstack/react-query";
import { API } from "../../../../types/api";
import { callAPI } from "../../../../modules/utils";
import LoadingScreen from "../../../../components/LoadingScreen/LoadingScreen";
import MessagePanel from "../../../../components/MessagePanel/MessagePanel";
import ReviewPanel from "../../../../components/ReviewPanel/ReviewPanel";
import { useParams } from "react-router-dom";
import { useMemo } from "react";

export default function ReviewsView() {
	const params = useParams();

	const instructorID = useMemo(
		() => parseInt(params["instructorId"] ?? ""),
		[]
	);

	const { data, isFetching } = useQuery<
		API.Reviews.GetReviewsOfInstructor.IResponse,
		API.Reviews.GetReviewsOfInstructor.IEndpoint["error"]
	>({
		queryKey: ["Instructors", "#", instructorID, "Reviews"],
		queryFn: () =>
			callAPI<API.Reviews.GetReviewsOfInstructor.IEndpoint>(
				"GET",
				"/api/v1/instructors/:instructorID/reviews",
				null,
				{ instructorID }
			),
		retry: true,
		staleTime: 60000,
		enabled: !isNaN(instructorID),
	});

	return (
		<div className={commonClasses.ViewContainer}>
			<Typography variant="h5" gutterBottom>
				Opinie o instruktorze
			</Typography>
			<Divider />

			{isFetching && <LoadingScreen />}

			{data?.length == 0 && !isFetching ? (
				<MessagePanel image="/no-results.svg" caption="Brak opinii" />
			) : (
				<div className={classes.ContentWrapper}>
					<List className={classes.ReviewList}>
						{data?.map((r) => (
							<ReviewPanel key={r.id} review={r} />
						))}
					</List>
				</div>
			)}
		</div>
	);
}
