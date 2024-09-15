import { Button, Typography } from "@mui/material";
import ViewWrapper from "../Wrapper";
import InstructorTable from "./components/InstructorTable";
import { Add } from "@mui/icons-material";
import commonClasses from "../common.module.css";
import classes from "./Instructors.module.css";
import { useNavigate, useParams } from "react-router-dom";
import React, { useCallback, useContext, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SchoolPageContext } from "../../ManageSchoolPage";
import { c, OutsideContextNotifier } from "../../../../modules/utils";
import InviteTable from "./components/InviteTable";

interface IContext {
	baseQueryKey: (string | number)[];
	invalidateQuery: () => void;
}

export const InstructorsContext = React.createContext<IContext>({
	invalidateQuery: OutsideContextNotifier,
	baseQueryKey: [],
});

export default function InstructorsSchoolView() {
	const params = useParams();
	const { viewPoint } = useContext(SchoolPageContext);
	const qClient = useQueryClient();
	const navigate = useNavigate();

	const queryKey = useMemo(
		() => ["Schools", "#", parseInt(params["id"] ?? ""), "Instructors"],
		[params]
	);
	const invalidateQuery = useCallback(() => {
		qClient.invalidateQueries({
			queryKey: queryKey,
		});
	}, [queryKey]);

	return (
		<ViewWrapper headline="Instruktorzy">
			<InstructorsContext.Provider
				value={{ invalidateQuery, baseQueryKey: queryKey }}
			>
				<div className={commonClasses.SectionHeader}>
					<Typography variant="overline"></Typography>
					{viewPoint == "owner" && (
						<Button
							startIcon={<Add />}
							variant="contained"
							size="small"
							onClick={() => navigate("invite")}
						>
							Dodaj
						</Button>
					)}
				</div>

				<InstructorTable schoolID={parseInt(params["id"] ?? "")} />

				<div
					className={c([
						commonClasses.SectionHeader,
						classes.InviteSection,
					])}
				>
					<Typography variant="overline">Zaproszenia</Typography>
				</div>

				<InviteTable schoolID={parseInt(params["id"] ?? "")} />
			</InstructorsContext.Provider>
		</ViewWrapper>
	);
}
