import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import { App } from "../../../../../types/app";
import {
	DEFAULT_TABLE_PAGE_SIZE,
	TABLE_PAGE_SIZE_OPTIONS,
} from "../../../../constants";
import { CurrencyFormatter } from "../../../../../modules/formatters";
import AuthService from "../../../../../services/Auth";
import { renderCategoryChips } from "../../../../../modules/features";

interface IProps {
	courses: App.Models.IShortCourse[];
}

export default function InstructorCourseTable({ courses }: IProps) {
	const [paginationModel, setPaginationModel] = useState({
		pageSize: DEFAULT_TABLE_PAGE_SIZE,
		page: 0,
	});

	const columns = useMemo(() => {
		const result: GridColDef<App.Models.IShortCourse>[] = [
			{ field: "id", headerName: "ID", width: 75, type: "number" },
			{
				field: "student",
				headerName: "Kursant",
				width: 150,
				type: "string",
				valueGetter: (_v, row) =>
					AuthService.getUserFullName(row.student),
			},
			{
				field: "category",
				headerName: "Kategoria",
				width: 100,
				type: "custom",
				renderCell: (params) =>
					renderCategoryChips([params.row.category]),
			},
			{
				field: "hoursCount",
				headerName: "Ilość godzin",
				width: 100,
				type: "number",
			},
			{
				field: "pricePerHour",
				headerName: "Cena za godzinę",
				width: 125,
				type: "number",
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
				field: "createdAt",
				headerName: "Zakupiono",
				width: 250,
				type: "dateTime",
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
	}, []);

	return (
		<>
			<DataGrid
				rows={courses}
				paginationMode="client"
				columns={columns}
				pageSizeOptions={TABLE_PAGE_SIZE_OPTIONS}
				paginationModel={paginationModel}
				onPaginationModelChange={setPaginationModel}
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
