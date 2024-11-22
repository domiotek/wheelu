import { Typography } from "@mui/material";
import ReviewPanel from "../../../../../components/ReviewPanel/ReviewPanel";
import classes from "../ManageView.module.css";

interface IProps {
	review?: App.Models.IReview;
}

export default function ReviewPresentation({ review }: IProps) {
	return (
		<div className={classes.ReviewPresentationWrapper}>
			{review ? (
				<ReviewPanel review={review} />
			) : (
				<Typography variant="body2">Brak opinii</Typography>
			)}
		</div>
	);
}
