import { Button, Rating, TextField } from "@mui/material";
import classes from "./PostReview.module.css";
import { useCallback, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { callAPI } from "../../../../../modules/utils";
import { toast } from "react-toastify";
import { API } from "../../../../../types/api";
import { ReviewTargetType } from "../../../../../modules/enums";

interface IProps {
	courseID: number;
	review?: App.Models.IReview;
	placeholder: string;
	targetType: ReviewTargetType;
	disabled?: boolean;
}

export default function PostReview({
	courseID,
	review,
	placeholder,
	targetType,
	disabled,
}: IProps) {
	const [rating, setRating] = useState<number>(0);
	const [message, setMessage] = useState<string>("");

	const submitMutation = useMutation<
		null,
		API.Reviews.PostReview.IEndpoint["error"],
		API.Reviews.PostReview.IRequest
	>({
		mutationFn: (data) =>
			callAPI<API.Reviews.PostReview.IEndpoint>(
				"POST",
				"/api/v1/courses/:courseID/review",
				data,
				{ courseID },
				true
			),
		onSuccess: () => toast.success("Opinia została zapisana."),
		onError: () => toast.error("Nie udało się zapisać opinii."),
	});

	useEffect(() => {
		console.log(review);
		if (!review) return;

		setRating(review.grade);
		setMessage(review.message ?? "");
	}, [review]);

	return (
		<div className={classes.Wrapper}>
			<Rating
				size="large"
				value={rating}
				onChange={(_e, val) => setRating(val ?? 0)}
			/>

			<TextField
				value={message}
				onChange={(e) => setMessage(e.target.value)}
				multiline
				minRows={3}
				maxRows={6}
				variant={"outlined"}
				placeholder={placeholder}
				label="Powiedz coś więcej (opcjonalne)"
				color="secondary"
				helperText={`${message.length} / 255`}
			/>
			<Button
				variant="contained"
				color="secondary"
				disabled={rating == 0 || submitMutation.isPending || disabled}
				onClick={() =>
					submitMutation.mutate({
						grade: rating,
						message: message,
						targetType,
					})
				}
			>
				Zapisz
			</Button>
		</div>
	);
}
