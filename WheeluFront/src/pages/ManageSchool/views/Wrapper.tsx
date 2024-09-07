import { ChevronLeft } from "@mui/icons-material";
import { Button, Stack, Typography } from "@mui/material";
import classes from "../ManageSchoolPage.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import { popUrlSegment } from "../../../modules/utils";

interface IProps {
	children: JSX.Element;
	headline: string;
}

export default function ViewWrapper({ children, headline }: IProps) {
	const location = useLocation();
	const navigate = useNavigate();

	return (
		<Stack>
			<Stack direction="row" alignItems="center" sx={{ mb: 4 }}>
				<Button
					className={classes.GoBackButton}
					startIcon={<ChevronLeft />}
					color="secondary"
					onClick={() => navigate(popUrlSegment(location.pathname))}
				>
					Wróć
				</Button>
				<Typography variant="overline" sx={{ ml: 4 }}>
					{headline}
				</Typography>
			</Stack>
			{children}
		</Stack>
	);
}
