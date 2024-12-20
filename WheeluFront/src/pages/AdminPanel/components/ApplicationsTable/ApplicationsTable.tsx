import { DataGrid, GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useRef, useState } from "react";
import { API } from "../../../../types/api";
import { callAPI, formatAddress } from "../../../../modules/utils";
import SchoolApplicationService from "../../../../services/SchoolApplication";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface IProps {
	supportFilter?: boolean;
}

export default function ApplicationsTable({ supportFilter }: IProps) {
	const [paginationModel, setPaginationModel] = useState({
		pageSize: 25,
		page: 0,
	});

	const loadingRef = useRef<number | string>();

	const qClient = useQueryClient();
	const navigate = useNavigate();

	const { data, isFetching } = useQuery<
		API.Application.GetAll.IResponse,
		API.Application.GetAll.IEndpoint["error"]
	>({
		queryKey: ["Applications"].concat(
			supportFilter
				? []
				: [
						paginationModel.pageSize.toString(),
						paginationModel.page.toString(),
				  ]
		),
		queryFn: () =>
			callAPI<API.Application.GetAll.IEndpoint>(
				"GET",
				"/api/v1/applications",
				{
					PageNumber: supportFilter
						? undefined
						: paginationModel.page,
					PagingSize: supportFilter
						? undefined
						: paginationModel.pageSize,
				}
			),
		retry: true,
		staleTime: 60000,
	});

	const quickRejectMutation = useMutation<
		null,
		API.Application.Reject.IEndpoint["error"],
		API.Application.Reject.IRequestData & { id: string }
	>({
		mutationFn: (data) =>
			callAPI<API.Application.Reject.IEndpoint>(
				"POST",
				"/api/v1/applications/:id/reject",
				data,
				{ id: data.id },
				true
			),
		onSuccess: async () => {
			qClient.invalidateQueries({ queryKey: ["Applications"] });
			if (loadingRef.current) {
				toast.done(loadingRef.current);
				loadingRef.current = undefined;
			}
		},
		onError: () => {
			toast.error("Nie udało się odrzucić wniosku.");
			if (loadingRef.current) {
				toast.done(loadingRef.current);
				loadingRef.current = undefined;
			}
		},
	});

	const deleteMutation = useMutation<
		null,
		API.Application.Delete.IEndpoint["error"],
		{ id: string }
	>({
		mutationFn: (data) =>
			callAPI<API.Application.Delete.IEndpoint>(
				"DELETE",
				"/api/v1/applications/:id",
				data,
				{ id: data.id },
				true
			),
		onSuccess: async () => {
			qClient.invalidateQueries({ queryKey: ["Applications"] });
			if (loadingRef.current) {
				toast.done(loadingRef.current);
				loadingRef.current = undefined;
			}
		},
		onError: () => {
			toast.error("Nie udało się usunąć wniosku.");
			if (loadingRef.current) {
				toast.done(loadingRef.current);
				loadingRef.current = undefined;
			}
		},
	});

	const showProgressSnack = useCallback((message: string) => {
		if (loadingRef.current) toast.done(loadingRef.current);
		loadingRef.current = toast.loading(message);
	}, []);

	const columns = useMemo(() => {
		const result: GridColDef<App.Models.IApplication>[] = [
			{ field: "id", headerName: "ID", width: 35, type: "number" },
			{
				field: "status",
				headerName: "Status",
				width: 120,
				type: "string",
				valueGetter: (value) =>
					SchoolApplicationService.translateApplicationStatus(value),
			},
			{
				field: "nip",
				headerName: "NIP",
				width: 125,
				type: "number",
				headerAlign: "left",
			},
			{
				field: "schoolName",
				headerName: "Nazwa szkoły",
				width: 150,
				type: "string",
			},
			{
				field: "owner",
				headerName: "Właściciel",
				width: 150,
				valueGetter: (_value, row) => {
					return `${row.ownerName} ${row.ownerSurname}`;
				},
			},
			{
				field: "address",
				headerName: "Adres",
				width: 250,
				valueGetter: (_value, row) => {
					return formatAddress(row as any as App.Models.IAddress);
				},
			},
			{
				field: "appliedAt",
				headerName: "Data złożenia",
				width: 250,
				type: "dateTime",
				valueGetter: (value) => new Date(value),
			},
			{
				field: "resolvedAt",
				headerName: "Data rozpatrzenia",
				width: 250,
				type: "dateTime",
				valueGetter: (value) =>
					value != undefined ? new Date(value) : undefined,
			},
			{
				field: "rejectionReason",
				headerName: "Powód odrzucenia",
				width: 120,
				type: "string",
			},
			{
				field: "rejectionMessage",
				headerName: "Opis odrzucenia",
				width: 240,
				type: "string",
			},
			{
				field: "actions",
				headerName: "Akcje",
				renderHeader: () => "",
				type: "actions",
				flex: 1,
				align: "right",
				getActions: (params) => {
					let actions = [
						<GridActionsCellItem
							label="Zadzwoń"
							showInMenu
							onClick={() =>
								(window.location.href = `tel:${params.row.phoneNumber}`)
							}
						/>,
						<GridActionsCellItem
							label="Napisz email"
							showInMenu
							onClick={() =>
								(window.location.href = `mailto:${params.row.email}`)
							}
						/>,
						<GridActionsCellItem
							label={
								params.row.status == "pending"
									? "Rozpatrz"
									: "Zobacz wniosek"
							}
							showInMenu
							onClick={() =>
								navigate(`/panel/applications/${params.id}`)
							}
						/>,
					];

					if (params.row.status == "pending")
						actions = actions.concat([
							<GridActionsCellItem
								label="Odrzuć"
								showInMenu
								onClick={() => {
									showProgressSnack("Przetwarzanie żądania");
									quickRejectMutation.mutate({
										Reason: "Unspecified",
										id: params.row.id?.toString() ?? "",
									});
								}}
							/>,
						]);
					else
						actions = actions.concat([
							<GridActionsCellItem
								label="Usuń"
								showInMenu
								onClick={() => {
									showProgressSnack("Przetwarzanie żądania");
									deleteMutation.mutate({
										id: params.row.id?.toString() ?? "",
									});
								}}
							/>,
						]);

					return actions;
				},
			},
		];

		return result;
	}, []);

	return (
		<>
			<DataGrid
				rows={data?.entries ?? []}
				paginationMode={supportFilter ? "client" : "server"}
				columns={columns}
				pageSizeOptions={[15, 25, 35, 50, 75, 100]}
				paginationModel={paginationModel}
				onPaginationModelChange={setPaginationModel}
				loading={
					isFetching ||
					quickRejectMutation.isPending ||
					deleteMutation.isPending
				}
				autoHeight={true}
				rowCount={supportFilter ? undefined : data?.totalCount ?? 0}
				disableColumnFilter={!supportFilter}
				initialState={{
					columns: {
						columnVisibilityModel: {
							rejectionReason: false,
							rejectionMessage: false,
						},
					},
					sorting: {
						sortModel: [
							{
								field: "id",
								sort: "asc",
							},
						],
					},
				}}
				onRowDoubleClick={(row) => navigate(`applications/${row.id}`)}
			/>
		</>
	);
}
