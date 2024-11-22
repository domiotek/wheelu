import { Rating, Typography } from "@mui/material";
import { formatPolishWordSuffix } from "../../modules/utils";

interface IProps {
	grade: number;
	reviewCount: number;
	readonly?: boolean;
}

export default function RatingWidget({ grade, reviewCount, readonly }: IProps) {
	return (
		<div>
			<Rating value={grade} readOnly={readonly} precision={0.1} />
			<Typography variant="body2">
				{reviewCount! > 0
					? `${grade.toFixed(
							1
					  )} (${reviewCount} ocen${formatPolishWordSuffix(
							reviewCount!,
							["a", "y", ""]
					  )})`
					: "Brak ocen"}
			</Typography>
		</div>
	);
}
