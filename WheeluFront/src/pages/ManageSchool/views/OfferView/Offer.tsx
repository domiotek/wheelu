import { Button, Typography } from "@mui/material";
import ViewWrapper from "../Wrapper";
import CourseTable from "./components/CourseTable";
import { Add } from "@mui/icons-material";
import classes from "../common.module.css";
import { useParams } from "react-router-dom";
import React, { useCallback, useContext, useMemo } from "react";
import { AppContext } from "../../../../App";
import ManageCourseOfferModal from "../../../../modals/ManageCourseOfferModal/ManageCourseOfferModal";
import { useQueryClient } from "@tanstack/react-query";
import { SchoolPageContext } from "../../ManageSchoolPage";
import { OutsideContextNotifier } from "../../../../modules/utils";

interface IContext {
	queryKey: (string | number)[];
	invalidateQuery: () => void;
}

export const CourseOffersContext = React.createContext<IContext>({
	invalidateQuery: OutsideContextNotifier,
	queryKey: [],
});

export default function OfferSchoolView() {
	const params = useParams();
	const { setModalContent } = useContext(AppContext);
	const { access } = useContext(SchoolPageContext);
	const qClient = useQueryClient();

	const queryKey = useMemo(
		() => ["Schools", "#", parseInt(params["id"] ?? ""), "Offers"],
		[params]
	);
	const invalidateQuery = useCallback(() => {
		qClient.invalidateQueries({
			queryKey,
		});
	}, [queryKey]);

	const addCourseCallback = useCallback(() => {
		setModalContent(
			<ManageCourseOfferModal
				mode="create"
				onSuccess={invalidateQuery}
				schoolID={params["id"] ?? ""}
			/>
		);
	}, []);

	return (
		<ViewWrapper headline="Oferta">
			<CourseOffersContext.Provider
				value={{ invalidateQuery, queryKey: queryKey }}
			>
				<div className={classes.SectionHeader}>
					<Typography variant="overline">Kursy</Typography>
					{access == "owner" && (
						<Button
							startIcon={<Add />}
							variant="contained"
							size="small"
							onClick={addCourseCallback}
						>
							Dodaj
						</Button>
					)}
				</div>

				<CourseTable
					schoolID={parseInt(params["id"] ?? "")}
					showActions={access == "owner"}
				/>
			</CourseOffersContext.Provider>
		</ViewWrapper>
	);
}
