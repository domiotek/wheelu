import {
	ButtonBase,
	Divider,
	List,
	ListItem,
	ListItemText,
	Paper,
	Typography,
} from "@mui/material";
import classes from "./InstructorsView.module.css";
import commonClasses from "../Common.module.css";
import { useQuery } from "@tanstack/react-query";
import { API } from "../../../../types/api";
import { callAPI } from "../../../../modules/utils";
import { useContext } from "react";
import { PublicSchooPageContext } from "../../SchoolPage";
import LoadingScreen from "../../../../components/LoadingScreen/LoadingScreen";
import InlineDot from "../../../../components/InlineDot/InlineDot";
import { CurrencyFormatter } from "../../../../modules/formatters";
import { useNavigate } from "react-router-dom";
import NoResultsMessage from "../../../../components/NoResultsMessage/NoResultsMessage";

export default function InstructorsView() {
	const { schoolID } = useContext(PublicSchooPageContext);
	const navigate = useNavigate();

	const { data, isFetching } = useQuery<
		API.Offers.Courses.GetAllOfSchool.IResponse,
		API.Offers.Courses.GetAllOfSchool.IEndpoint["error"]
	>({
		queryKey: ["Schools", "#", parseInt("3"), "Offers"],
		queryFn: () =>
			callAPI<API.Offers.Courses.GetAllOfSchool.IEndpoint>(
				"GET",
				"/api/v1/offers",
				{ schoolID }
			),
		retry: true,
		staleTime: 60000,
		enabled: schoolID != null,
	});

	return (
		<div className={commonClasses.ViewContainer}>
			<Typography variant="h5" gutterBottom>
				Kursy
			</Typography>
			<Divider />

			{isFetching && <LoadingScreen />}

			{data?.entries.length == 0 && !isFetching ? (
				<NoResultsMessage caption="Brak ofert" />
			) : (
				<List>
					{data?.entries.map((offer) => (
						<ButtonBase
							key={offer.id}
							className={classes.OfferPanel}
							component={ListItem}
							onClick={() =>
								navigate(
									`/schools/${schoolID}/courses/${offer.id}`
								)
							}
						>
							<Paper>
								<ListItemText
									primary={`Kategoria ${offer.category.name}`}
									secondary={
										<>
											2 instruktorów{" "}
											<InlineDot color="secondary" /> 4
											pojazdy{" "}
											<InlineDot color="secondary" /> 23
											kursantów (1 aktywny)
										</>
									}
								/>
								<ListItemText
									className={classes.RightOfferPanel}
									primary={CurrencyFormatter.format(
										offer.price
									)}
									secondary={`${offer.hoursCount} godzin(y)`}
								/>
							</Paper>
						</ButtonBase>
					))}
				</List>
			)}
		</div>
	);
}
