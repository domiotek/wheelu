import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { QueryKey, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { API } from "../../../types/api";
import { callAPI } from "../../../modules/utils";
import {
	DEFAULT_TABLE_PAGE_SIZE,
	TABLE_PAGE_SIZE_OPTIONS,
} from "../../../pages/constants";
import { DateTime } from "luxon";

interface IProps {
	instructorProfileID: number;
	supportFilter?: boolean;
	queryKey: QueryKey;
}

export default function EmploymentHistoryTable({
	instructorProfileID,
	queryKey,
}: IProps) {
	const [paginationModel, setPaginationModel] = useState({
		pageSize: DEFAULT_TABLE_PAGE_SIZE,
		page: 0,
	});

	const { data, isFetching } = useQuery<
		API.Instructors.GetProfile.IResponse,
		API.Instructors.GetProfile.IEndpoint["error"],
		App.UI.AccountProfile.IInstructorEmploymentRecord[]
	>({
		queryKey,
		queryFn: () =>
			callAPI<API.Instructors.GetProfile.IEndpoint>(
				"GET",
				"/api/v1/instructors/:instructorID",
				null,
				{ instructorID: instructorProfileID }
			),
		retry: true,
		staleTime: 60000,
		select: (profile) => {
			return profile.employmentHistory.flatMap((employee) =>
				employee.employmentRecords.map((rec) => ({
					id: rec.id,
					schoolName: employee.school.name,
					startTime: DateTime.fromISO(rec.startTime).toJSDate(),
					endTime: rec.endTime
						? DateTime.fromISO(rec.endTime).toJSDate()
						: undefined,
				}))
			);
		},
	});

	const columns = useMemo(() => {
		const result: GridColDef<App.UI.AccountProfile.IInstructorEmploymentRecord>[] =
			[
				{
					field: "schoolName",
					headerName: "Szkoła",
					width: 150,
					type: "string",
				},
				{
					field: "startTime",
					headerName: "Data rozpoczęcia",
					width: 150,
					type: "date",
				},
				{
					field: "endTime",
					headerName: "Data zakończenia",
					width: 150,
					type: "date",
				},
			];

		return result;
	}, []);

	return (
		<>
			<DataGrid
				rows={data}
				columns={columns}
				pageSizeOptions={TABLE_PAGE_SIZE_OPTIONS}
				paginationModel={paginationModel}
				onPaginationModelChange={setPaginationModel}
				loading={isFetching}
				autoHeight={true}
				initialState={{
					sorting: {
						sortModel: [
							{
								field: "endTime",
								sort: "asc",
							},
						],
					},
				}}
			/>
		</>
	);
}
