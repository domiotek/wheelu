import { DataGrid, GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useContext, useMemo, useState } from "react";
import { API } from "../../../../../types/api";
import { callAPI } from "../../../../../modules/utils";
import {
	DEFAULT_TABLE_PAGE_SIZE,
	TABLE_PAGE_SIZE_OPTIONS,
} from "../../../../constants";
import AuthService from "../../../../../services/Auth";
import { useNavigate } from "react-router-dom";
import { RequestsViewContext } from "../RequestsView";
import CourseService from "../../../../../services/Course";
import { RequestStatus } from "../../../../../modules/enums";
import { toast } from "react-toastify";
import { AppContext } from "../../../../../App";
import ViewChangeInstructorRequestModal from "../../../../../modals/ViewChangeInstructorRequestModal/ViewChangeInstructorRequestModal";
import { SchoolPageContext } from "../../../ManageSchoolPage";

interface IProps {
	schoolID: number;
	supportFilter?: boolean;
}

export default function ChangeInstructorRequestTable({
	schoolID,
	supportFilter,
}: IProps) {
	const [paginationModel, setPaginationModel] = useState({
		pageSize: DEFAULT_TABLE_PAGE_SIZE,
		page: 0,
	});

	const { setModalContent } = useContext(AppContext);
	const { access } = useContext(SchoolPageContext);
	const { queryKey, invalidateQuery } = useContext(RequestsViewContext);
	const navigate = useNavigate();

	const { data, isFetching } = useQuery<
		API.Courses.ChangeInstructorRequest.GetMany.IResponse,
		API.Courses.ChangeInstructorRequest.GetMany.IEndpoint["error"]
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
			callAPI<API.Courses.ChangeInstructorRequest.GetMany.IEndpoint>(
				"GET",
				"/api/v1/schools/:schoolID/instructor-change-requests",
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

	const rejectMutation = useMutation<
		null,
		API.Courses.ChangeInstructorRequest.PutStatus.IEndpoint["error"],
		{ requestID: number }
	>({
		mutationFn: (data) =>
			callAPI<API.Courses.ChangeInstructorRequest.PutStatus.IEndpoint>(
				"PUT",
				"/api/v1/schools/:schoolID/instructor-change-requests/:requestID",
				{ newStatus: RequestStatus.Rejected },
				{ schoolID, requestID: data.requestID }
			),
		onSuccess: () => {
			toast.success("Odrzucono wniosek.");
			invalidateQuery();
		},
		onError: () => toast.error("Nie udało się odrzucić wniosku."),
	});

	const viewRequestDetailsModal = useCallback(
		(request: App.Models.IInstructorChangeRequest) => {
			setModalContent(
				<ViewChangeInstructorRequestModal
					request={request}
					canEdit={access == "owner"}
					invalidateQuery={invalidateQuery}
				/>
			);
		},
		[]
	);

	const columns = useMemo(() => {
		const result: GridColDef<App.Models.IInstructorChangeRequest>[] = [
			{ field: "id", headerName: "ID", width: 75, type: "number" },
			{
				field: "requestor",
				headerName: "Wnioskodawca",
				width: 150,
				type: "string",
				filterable: supportFilter,
				valueGetter: (_v, row) =>
					AuthService.getUserFullName(row.requestor),
			},
			{
				field: "requestorType",
				headerName: "Rola",
				width: 125,
				type: "string",
				filterable: supportFilter,
				valueGetter: (val) => CourseService.formatRequestorType(val),
			},
			{
				field: "status",
				headerName: "Stan",
				width: 100,
				type: "string",
				filterable: supportFilter,
				valueGetter: (val) => CourseService.formatRequestStatus(val),
			},
			{
				field: "note",
				headerName: "Uzasadnienie",
				width: 300,
				maxWidth: 400,
				type: "string",
				filterable: false,
			},
			{
				field: "requestedAt",
				headerName: "Utworzono",
				width: 250,
				type: "dateTime",
				filterable: supportFilter,
				valueGetter: (value) => new Date(value),
			},
			{
				field: "lastStatusChange",
				headerName: "Ostatnia zmiana stanu",
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
				getActions: (params) => {
					var opts = [
						<GridActionsCellItem
							label="Zobacz"
							showInMenu
							onClick={() => viewRequestDetailsModal(params.row)}
						/>,
					];

					if (params.row.status == RequestStatus.Pending)
						opts.push(
							<GridActionsCellItem
								label="Odrzuć"
								showInMenu
								onClick={() =>
									rejectMutation.mutate({
										requestID: params.row.id,
									})
								}
							/>
						);
					return opts;
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
				onRowDoubleClick={(row) => navigate(`/courses/${row.id}`)}
			/>
		</>
	);
}
