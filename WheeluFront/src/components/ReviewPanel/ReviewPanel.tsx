import {
	Avatar,
	ListItem,
	ListItemAvatar,
	Rating,
	Typography,
} from "@mui/material";
import { initialsAvatarProps } from "../../modules/features";
import AuthService from "../../services/Auth";
import InlineDot from "../InlineDot/InlineDot";
import { DateTimeFormatter } from "../../modules/formatters";
import classes from "./ReviewPanel.module.css";

interface IProps {
	review: App.Models.IReview;
}

export default function ReviewPanel({ review }: IProps) {
	return (
		<ListItem>
			<ListItemAvatar className={classes.Avatar}>
				<Avatar
					{...initialsAvatarProps(
						AuthService.getUserFullName(review.student)
					)}
				/>
			</ListItemAvatar>
			<div className={classes.DetailsWrapper}>
				<Rating value={review.grade} precision={0.5} readOnly />
				<Typography variant="caption">
					{AuthService.getUserFullName(review.student)}
					{review.edited && " (modyfikowana)"}{" "}
					<InlineDot color="secondary" />{" "}
					{DateTimeFormatter.formatAdaptiveFriendly(review.created)}
				</Typography>
				<Typography>{review.message}</Typography>
			</div>
		</ListItem>
	);
}
