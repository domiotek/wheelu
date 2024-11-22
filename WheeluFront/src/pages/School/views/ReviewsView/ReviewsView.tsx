import { Alert, Divider, List, Typography } from "@mui/material";
import classes from "./ReviewsView.module.css";
import commonClasses from "../Common.module.css";
import { useQuery } from "@tanstack/react-query";
import { API } from "../../../../types/api";
import { callAPI } from "../../../../modules/utils";
import { useContext } from "react";
import { PublicSchooPageContext } from "../../SchoolPage";
import LoadingScreen from "../../../../components/LoadingScreen/LoadingScreen";
import MessagePanel from "../../../../components/MessagePanel/MessagePanel";
import ReviewPanel from "../../../../components/ReviewPanel/ReviewPanel";

export default function ReviewsView() {
	const { schoolID } = useContext(PublicSchooPageContext);

	const { data, isFetching } = useQuery<
		API.Reviews.GetReviewsOfSchool.IResponse,
		API.Reviews.GetReviewsOfSchool.IEndpoint["error"]
	>({
		queryKey: ["Schools", "#", schoolID, "Reviews"],
		queryFn: () =>
			callAPI<API.Reviews.GetReviewsOfSchool.IEndpoint>(
				"GET",
				"/api/v1/schools/:schoolID/reviews",
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
				Opinie
			</Typography>
			<Divider />

			{isFetching && <LoadingScreen />}

			{data?.length == 0 && !isFetching ? (
				<MessagePanel image="/no-results.svg" caption="Brak opinii" />
			) : (
				<div className={classes.ContentWrapper}>
					<Alert variant="outlined" severity="info">
						Te opinie odnoszą się do szkoły jazdy i skupiają się na
						takich aspektach, jak stan techniczny pojazdów.
					</Alert>
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
