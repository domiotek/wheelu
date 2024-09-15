import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import { useContext, useMemo, useState } from "react";
import { API } from "../../../../../types/api";
import { callAPI } from "../../../../../modules/utils.tsx";
import { App } from "../../../../../types/app";
import {
	DEFAULT_TABLE_PAGE_SIZE,
	TABLE_PAGE_SIZE_OPTIONS,
} from "../../../../constants.ts";
import { InstructorsContext } from "../Instructors.tsx";
import { IconButton } from "@mui/material";
import { Message } from "@mui/icons-material";

interface IProps {
	schoolID: number;
}

export default function InstructorTable({ schoolID }: IProps) {
	const [paginationModel, setPaginationModel] = useState({
		pageSize: DEFAULT_TABLE_PAGE_SIZE,
		page: 0,
	});

	const { baseQueryKey: queryKey } = useContext(InstructorsContext);

	const { data, isFetching } = useQuery<
		API.Instructors.GetAllOfSchool.IResponse,
		API.Instructors.GetAllOfSchool.IEndpoint["error"]
	>({
		queryKey,
		queryFn: () =>
			callAPI<API.Instructors.GetAllOfSchool.IEndpoint>(
				"GET",
				"/api/v1/schools/:schoolID/instructors",
				null,
				{ schoolID }
			),
		retry: true,
		staleTime: 60000,
	});

	const columns = useMemo(() => {
		const result: GridColDef<App.Models.IEmployedInstructor>[] = [
			{ field: "id", headerName: "ID", width: 75, type: "number" },
			{
				field: "instructor",
				headerName: "Imię i nazwisko",
				width: 150,
				type: "string",
				valueGetter: (_, row) =>
					`${row.instructor.user.name} ${row.instructor.user.surname}`,
			},
			{
				field: "detached",
				headerName: "Zatrudniony",
				width: 150,
				type: "boolean",
				valueGetter: (_, row) => !row.detached,
			},
			{
				field: "visible",
				headerName: "Widoczny",
				width: 125,
				type: "boolean",
			},
			{
				field: "allowedCategories",
				headerName: "Kategorie",
				width: 150,
				type: "custom",
				renderCell: () => <></>,
			},
			{
				field: "actions",
				headerName: "",
				width: 75,
				type: "custom",
				renderCell: () => {
					return (
						<IconButton>
							<Message />
						</IconButton>
					);
				},
			},
		];

		return result;
	}, []);

	return (
		<>
			<DataGrid
				rows={data?.entries ?? []}
				paginationMode="client"
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
								field: "id",
								sort: "asc",
							},
						],
					},
				}}
			/>
		</>
	);
}
