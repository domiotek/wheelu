import { DataGrid, GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useContext, useMemo } from "react";
import { API } from "../../../../../types/api";
import { callAPI } from "../../../../../modules/utils";
import { App } from "../../../../../types/app";
import { TABLE_PAGE_SIZE_OPTIONS } from "../../../../constants";
import { AppContext } from "../../../../../App";
import { useSnackbar } from "notistack";
import { VehicleContext } from "../Vehicles";
import VehicleModal from "../../../../../modals/VehicleModal/VehicleModal";
import VehicleService from "../../../../../services/Vehicle";
import { CourseCategoriesMapping } from "../../../../../modules/constants";
import { Chip } from "@mui/material";

interface IProps {
	schoolID: number;
	limitActions: boolean;
}

export default function VehicleTable({ schoolID, limitActions }: IProps) {
	const { setModalContent, snackBarProps } = useContext(AppContext);
	const { queryKey, invalidateQuery } = useContext(VehicleContext);
	const snackBar = useSnackbar();

	const { data, isFetching } = useQuery<
		API.Vehicles.GetAllOfSchool.IResponse,
		API.Vehicles.GetAllOfSchool.IEndpoint["error"]
	>({
		queryKey,
		queryFn: () =>
			callAPI<API.Vehicles.GetAllOfSchool.IEndpoint>(
				"GET",
				"/api/v1/schools/:schoolID/vehicles",
				null,
				{ schoolID }
			),
		retry: true,
		staleTime: 60000,
	});

	const deleteMutation = useMutation<
		null,
		API.Vehicles.Delete.IEndpoint["error"],
		{ id: number }
	>({
		mutationFn: (data) =>
			callAPI<API.Vehicles.Delete.IEndpoint>(
				"DELETE",
				"/api/v1/schools/:schoolID/vehicles/:vehicleID",
				null,
				{ schoolID, vehicleID: data.id }
			),
		onSuccess: invalidateQuery,
		onError: () =>
			snackBar.enqueueSnackbar({
				...snackBarProps,
				message: "Nie udało się usunąć pojazdu",
				variant: "error",
			}),
	});

	const editVehicleCallback = useCallback(
		(data: App.Models.IShortVehicle) => {
			setModalContent(
				<VehicleModal
					mode="update"
					schoolID={schoolID}
					vehicleID={data.id}
					baseQuery={queryKey}
					onSuccess={() => {
						invalidateQuery();
						snackBar.enqueueSnackbar({
							...snackBarProps,
							message: "Pomyślnie zapisano zmiany",
							variant: "success",
						});
					}}
					allowEdit={!limitActions}
				/>
			);
		},
		[]
	);

	const columns = useMemo(() => {
		const result: GridColDef<App.Models.IShortVehicle>[] = [
			{
				field: "model",
				headerName: "Model",
				width: 150,
				type: "string",
			},
			{
				field: "manufacturingYear",
				headerName: "Rocznik",
				width: 100,
				type: "string",
			},
			{
				field: "plate",
				headerName: "Numer rejestracyjny",
				width: 150,
				type: "string",
			},

			{
				field: "lastInspection",
				headerName: "Ostatni przegląd",
				width: 125,
				type: "dateTime",
				valueGetter: (value) => (value ? new Date(value) : undefined),
				valueFormatter: (value) => value ?? "Nie podano",
			},
			{
				field: "allowIn",
				headerName: "Kategorie",
				width: 150,
				type: "custom",
				renderCell: (params) => (
					<>
						{CourseCategoriesMapping.filter((cat) =>
							params.row.allowedIn.includes(cat.id)
						).map((category) => {
							return (
								<Chip
									key={category.id}
									label={category.name}
									size="small"
									color="secondary"
									sx={{ ml: "0.15em", mr: "0.15em" }}
								/>
							);
						})}
					</>
				),
			},
			{
				field: "worstPart",
				headerName: "Część w najgorszym stanie",
				width: 200,
				type: "string",
				valueGetter: (_value, row) =>
					VehicleService.getPartProps(row.worstPart.part.id).name,
			},
			{
				field: "actions",
				headerName: "",
				width: 75,
				type: "actions",
				getActions: (params) => {
					const result = [
						<GridActionsCellItem
							label={limitActions ? "Zobacz" : "Edytuj"}
							showInMenu
							onClick={() => editVehicleCallback(params.row)}
						/>,
					];

					if (!limitActions) {
						result.push(
							<GridActionsCellItem
								label="Usuń"
								showInMenu
								onClick={() =>
									deleteMutation.mutate({ id: params.row.id })
								}
							/>
						);
					}

					return result;
				},
			},
		];

		return result;
	}, [limitActions]);

	return (
		<>
			<DataGrid
				rows={data ?? []}
				paginationMode="client"
				columns={columns}
				pageSizeOptions={TABLE_PAGE_SIZE_OPTIONS}
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