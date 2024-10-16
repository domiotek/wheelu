import { DataGrid, GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useContext, useMemo, useState } from "react";
import { API } from "../../../../../types/api";
import { callAPI } from "../../../../../modules/utils";
import { App } from "../../../../../types/app";
import {
	DEFAULT_TABLE_PAGE_SIZE,
	TABLE_PAGE_SIZE_OPTIONS,
} from "../../../../constants";
import { AppContext } from "../../../../../App";
import ManageCourseOfferModal from "../../../../../modals/ManageCourseOfferModal/ManageCourseOfferModal";
import { CourseOffersContext } from "../Offer";
import { CurrencyFormatter } from "../../../../../modules/formatters";
import { toast } from "react-toastify";

interface IProps {
	schoolID: number;
	showActions: boolean;
}

export default function CourseTable({ schoolID, showActions }: IProps) {
	const [paginationModel, setPaginationModel] = useState({
		pageSize: DEFAULT_TABLE_PAGE_SIZE,
		page: 0,
	});

	const { setModalContent } = useContext(AppContext);
	const { queryKey, invalidateQuery } = useContext(CourseOffersContext);

	const { data, isFetching } = useQuery<
		API.Offers.Courses.GetAllOfSchool.IResponse,
		API.Offers.Courses.GetAllOfSchool.IEndpoint["error"]
	>({
		queryKey,
		queryFn: () =>
			callAPI<API.Offers.Courses.GetAllOfSchool.IEndpoint>(
				"GET",
				"/api/v1/offers",
				{ schoolID }
			),
		retry: true,
		staleTime: 60000,
	});

	const deleteMutation = useMutation<
		null,
		API.Offers.Courses.Delete.IEndpoint["error"],
		{ id: number }
	>({
		mutationFn: (data) =>
			callAPI<API.Offers.Courses.Delete.IEndpoint>(
				"DELETE",
				"/api/v1/offers/:id",
				null,
				{ id: data.id }
			),
		onSuccess: invalidateQuery,
		onError: () => toast.error("Nie udało się usunąć kursu"),
	});

	const editCourseCallback = useCallback((data: App.Models.ICourseOffer) => {
		setModalContent(
			<ManageCourseOfferModal
				mode="update"
				data={data}
				onSuccess={invalidateQuery}
			/>
		);
	}, []);

	const columns = useMemo(() => {
		const result: GridColDef<App.Models.ICourseOffer>[] = [
			{ field: "id", headerName: "ID", width: 75, type: "number" },
			{
				field: "enabled",
				headerName: "Aktywny",
				width: 150,
				type: "boolean",
			},
			{
				field: "category",
				headerName: "Kategoria",
				width: 100,
				type: "string",
				valueGetter: (_val, row) => row.category.name,
			},

			{
				field: "hoursCount",
				headerName: "Ilość godzin",
				width: 150,
				type: "number",
			},
			{
				field: "price",
				headerName: "Cena",
				width: 125,
				type: "number",
				valueFormatter: (value) =>
					CurrencyFormatter.format(Number(value)),
			},
			{
				field: "pricePerHour",
				headerName: "Cena za godzinę",
				width: 150,
				type: "number",
				valueFormatter: (value) =>
					CurrencyFormatter.format(Number(value)),
			},
			{
				field: "lastUpdatedAt",
				headerName: "Ostatnia aktualizacja",
				width: 250,
				type: "dateTime",
				valueGetter: (value) => new Date(value),
			},
			{
				field: "createdAt",
				headerName: "Utworzono",
				width: 250,
				type: "dateTime",
				valueGetter: (value) => new Date(value),
			},
			{
				field: "actions",
				headerName: "",
				width: 75,
				type: "actions",
				getActions: (params) => {
					if (!showActions) return [];

					return [
						<GridActionsCellItem
							label="Edytuj"
							showInMenu
							onClick={() => editCourseCallback(params.row)}
						/>,
						<GridActionsCellItem
							label="Usuń"
							showInMenu
							onClick={() =>
								deleteMutation.mutate({ id: params.row.id })
							}
						/>,
					];
				},
			},
		];

		return result;
	}, [showActions]);

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
