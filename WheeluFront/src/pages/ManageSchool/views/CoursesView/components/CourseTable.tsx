import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import { useContext, useMemo, useState } from "react";
import { API } from "../../../../../types/api";
import { callAPI } from "../../../../../modules/utils";
import { App } from "../../../../../types/app";
import {
	DEFAULT_TABLE_PAGE_SIZE,
	TABLE_PAGE_SIZE_OPTIONS,
} from "../../../../constants";
import { CourseOffersContext } from "../Courses";
import { CurrencyFormatter } from "../../../../../modules/formatters";
import AuthService from "../../../../../services/Auth";
import { renderCategoryChips } from "../../../../../modules/features";

interface IProps {
	schoolID: number;
	supportFilter?: boolean;
}

export default function CourseTable({ schoolID, supportFilter }: IProps) {
	const [paginationModel, setPaginationModel] = useState({
		pageSize: DEFAULT_TABLE_PAGE_SIZE,
		page: 0,
	});

	const { queryKey } = useContext(CourseOffersContext);

	const { data, isFetching } = useQuery<
		API.Courses.GetManyOfSchool.IResponse,
		API.Courses.GetManyOfSchool.IEndpoint["error"]
	>({
		queryKey: queryKey.concat(
			supportFilter
				? []
				: [
						paginationModel.pageSize.toString(),
						paginationModel.page.toString(),
				  ]
		),
		queryFn: () =>
			callAPI<API.Courses.GetManyOfSchool.IEndpoint>(
				"GET",
				"/api/v1/schools/:schoolID/courses",
				{
					PageNumber: supportFilter
						? undefined
						: paginationModel.page,
					PagingSize: supportFilter
						? undefined
						: paginationModel.pageSize,
				},
				{ schoolID }
			),
		retry: true,
		staleTime: 60000,
	});

	const columns = useMemo(() => {
		const result: GridColDef<App.Models.IShortCourse>[] = [
			{ field: "id", headerName: "ID", width: 75, type: "number" },
			{
				field: "student",
				headerName: "Kursant",
				width: 150,
				type: "string",
				filterable: supportFilter,
				valueGetter: (_v, row) =>
					AuthService.getUserFullName(row.student),
			},
			{
				field: "category",
				headerName: "Kategoria",
				width: 100,
				type: "string",
				filterable: supportFilter,
				valueGetter: (_val, row) => renderCategoryChips([row.category]),
			},
			{
				field: "instructor",
				headerName: "Instruktor",
				width: 150,
				type: "string",
				filterable: supportFilter,
				valueGetter: (_v, row) =>
					AuthService.getUserFullName(row.instructor),
			},
			{
				field: "hoursCount",
				headerName: "Ilość godzin",
				width: 100,
				type: "number",
				filterable: supportFilter,
			},
			{
				field: "pricePerHour",
				headerName: "Cena za godzinę",
				width: 125,
				type: "number",
				filterable: supportFilter,
				valueFormatter: (value) =>
					CurrencyFormatter.format(Number(value)),
			},
			{
				field: "archived",
				headerName: "Zarchiwizowany",
				width: 125,
				type: "boolean",
			},
			{
				field: "purchasedAt",
				headerName: "Zakupiono",
				width: 250,
				type: "dateTime",
				filterable: supportFilter,
				valueGetter: (value) => new Date(value),
			},
			{
				field: "actions",
				headerName: "",
				width: 75,
				type: "actions",
				getActions: () => {
					return [];
				},
			},
		];

		return result;
	}, [supportFilter]);

	return (
		<>
			<DataGrid
				rows={data?.entries ?? []}
				paginationMode={supportFilter ? "client" : "server"}
				columns={columns}
				pageSizeOptions={TABLE_PAGE_SIZE_OPTIONS}
				paginationModel={paginationModel}
				onPaginationModelChange={setPaginationModel}
				loading={isFetching}
				autoHeight={true}
				rowCount={supportFilter ? undefined : data?.totalCount ?? 0}
				initialState={{
					sorting: {
						sortModel: [
							{
								field: "id",
								sort: "asc",
							},
						],
					},
					columns: {
						columnVisibilityModel: {
							pricePerHour: false,
						},
					},
				}}
			/>
		</>
	);
}
