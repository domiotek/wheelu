import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useQuery } from "@tanstack/react-query";
import { useContext, useMemo, useState } from "react";
import { API } from "../../types/api";
import { callAPI } from "../../modules/utils";
import { App } from "../../types/app";
import {
	DEFAULT_TABLE_PAGE_SIZE,
	TABLE_PAGE_SIZE_OPTIONS,
} from "../../pages/constants";
import { TransactionsViewContext } from "../../pages/ManageSchool/views/TransactionsView/Transactions";
import { CurrencyFormatter } from "../../modules/formatters";
import AuthService from "../../services/Auth";
import TransactionService from "../../services/Transaction";

interface IProps {
	schoolID?: number;
	userID?: string;
	supportFilter?: boolean;
}

export default function TransactionsTable({
	schoolID,
	userID,
	supportFilter,
}: IProps) {
	const [paginationModel, setPaginationModel] = useState({
		pageSize: DEFAULT_TABLE_PAGE_SIZE,
		page: 0,
	});

	const { queryKey } = useContext(TransactionsViewContext);

	const { data, isFetching } = useQuery<
		API.Transactions.GetManyOfTarget.IResponse,
		API.Transactions.GetManyOfTarget.IEndpoint["error"]
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
			callAPI<API.Transactions.GetManyOfTarget.IEndpoint>(
				"GET",
				"/api/v1/transactions",
				{
					PageNumber: supportFilter
						? undefined
						: paginationModel.page,
					PagingSize: supportFilter
						? undefined
						: paginationModel.pageSize,
					schoolID,
					userID,
				}
			),
		retry: true,
		staleTime: 60000,
	});

	const columns = useMemo(() => {
		const result: GridColDef<App.Models.IShortTransaction>[] = [
			{
				field: "id",
				headerName: "ID",
				width: schoolID ? 300 : 180,
				type: "number",
				valueGetter: (_v, row) =>
					schoolID ? row.id : row.tPayTransactionId,
			},
			{
				field: "student",
				headerName: "Kursant",
				width: 150,
				type: "string",
				filterable: supportFilter,
				valueGetter: (_v, row) => AuthService.getUserFullName(row.user),
			},
			{
				field: "state",
				headerName: "Status",
				width: 125,
				type: "string",
				filterable: supportFilter,
				valueGetter: (value) =>
					TransactionService.translateTransactionStatus(value),
			},
			{
				field: "itemCount",
				headerName: "Ilość pozycji",
				width: 150,
				type: "number",
				filterable: supportFilter,
			},
			{
				field: "totalAmount",
				headerName: "Wartość",
				width: 175,
				type: "number",
				filterable: supportFilter,
				valueFormatter: (val) => CurrencyFormatter.format(val),
			},
			{
				field: "registered",
				headerName: "Utworzono",
				width: 175,
				type: "dateTime",
				filterable: supportFilter,
				valueGetter: (value) => new Date(value),
			},
			{
				field: "lastUpdate",
				headerName: "Ostatnia zmiana",
				width: 175,
				type: "dateTime",
				filterable: supportFilter,
				valueGetter: (value) => new Date(value),
			},
		];

		if (schoolID)
			result.push({
				field: "tPayTransactionId",
				headerName: "Numer transakcji",
				width: 175,
				type: "string",
			});

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
