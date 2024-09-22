import { DataGrid, GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useContext, useMemo, useState } from "react";
import { API } from "../../../../../types/api";
import { callAPI } from "../../../../../modules/utils.tsx";
import { App } from "../../../../../types/app";
import {
	DEFAULT_TABLE_PAGE_SIZE,
	TABLE_PAGE_SIZE_OPTIONS,
} from "../../../../constants.ts";
import { InstructorsContext } from "../Instructors.tsx";
import { DateTime } from "luxon";
import { AppContext } from "../../../../../App.tsx";
import { useSnackbar } from "notistack";
import { SchoolPageContext } from "../../../ManageSchoolPage.tsx";

interface IProps {
	schoolID: number;
}

export default function InviteTable({ schoolID }: IProps) {
	const [paginationModel, setPaginationModel] = useState({
		pageSize: DEFAULT_TABLE_PAGE_SIZE,
		page: 0,
	});

	const { snackBarProps } = useContext(AppContext);
	const { baseQueryKey } = useContext(InstructorsContext);
	const { viewPoint } = useContext(SchoolPageContext);
	const snackBar = useSnackbar();
	const qClient = useQueryClient();

	const { data, isFetching } = useQuery<
		API.Instructors.Invities.GetAllOfSchool.IResponse,
		API.Instructors.Invities.GetAllOfSchool.IEndpoint["error"]
	>({
		queryKey: baseQueryKey.concat(["Invites"]),
		queryFn: () =>
			callAPI<API.Instructors.Invities.GetAllOfSchool.IEndpoint>(
				"GET",
				"/api/v1/schools/:schoolID/instructors/invites",
				null,
				{ schoolID }
			),
		retry: true,
		staleTime: 60000,
	});

	const invalidateQuery = useCallback(() => {
		qClient.invalidateQueries({
			queryKey: baseQueryKey.concat(["Invites"]),
		});
	}, []);

	const resendMutation = useMutation<
		null,
		API.Instructors.Invities.Resend.IEndpoint["error"],
		API.Instructors.Invities.IParams
	>({
		mutationFn: (data) =>
			callAPI<API.Instructors.Invities.Resend.IEndpoint>(
				"POST",
				"/api/v1/schools/:schoolID/instructors/invites/:tokenID",
				null,
				data
			),
		onSuccess: () => {
			invalidateQuery();
			snackBar.enqueueSnackbar({
				...snackBarProps,
				message: "Wiadomość wysłana!",
				variant: "success",
			});
		},
		onError: () =>
			snackBar.enqueueSnackbar({
				...snackBarProps,
				message: "Nie udało się wysłać wiadomości",
				variant: "error",
			}),
	});

	const renewMutation = useMutation<
		null,
		API.Instructors.Invities.Renew.IEndpoint["error"],
		API.Instructors.Invities.IParams
	>({
		mutationFn: (data) =>
			callAPI<API.Instructors.Invities.Renew.IEndpoint>(
				"PUT",
				"/api/v1/schools/:schoolID/instructors/invites/:tokenID",
				null,
				data
			),
		onSuccess: () => {
			invalidateQuery();
			snackBar.enqueueSnackbar({
				...snackBarProps,
				message: "Ważność zaproszenia odnowiona!",
				variant: "success",
			});
		},
		onError: () =>
			snackBar.enqueueSnackbar({
				...snackBarProps,
				message: "Nie udało się odnowić zaproszenia",
				variant: "error",
			}),
	});

	const cancelMutation = useMutation<
		null,
		API.Instructors.Invities.Cancel.IEndpoint["error"],
		API.Instructors.Invities.IParams
	>({
		mutationFn: (data) =>
			callAPI<API.Instructors.Invities.Cancel.IEndpoint>(
				"DELETE",
				"/api/v1/schools/:schoolID/instructors/invites/:tokenID",
				null,
				data
			),
		onSuccess: () => {
			invalidateQuery();
			snackBar.enqueueSnackbar({
				...snackBarProps,
				message: "Zaproszenie anulowane!",
				variant: "success",
			});
		},
		onError: () =>
			snackBar.enqueueSnackbar({
				...snackBarProps,
				message: "Nie udało się anulować zaproszenia",
				variant: "error",
			}),
	});

	const columns = useMemo(() => {
		const result: GridColDef<App.Models.IInstructorInvite>[] = [
			{ field: "id", headerName: "ID", width: 300, type: "string" },
			{
				field: "email",
				headerName: "Email",
				width: 250,
				type: "string",
			},
			{
				field: "createdAt",
				headerName: "Wygasa",
				width: 250,
				type: "dateTime",
				valueGetter: (_, row) =>
					DateTime.fromISO(row.createdAt)
						.plus({ days: 24 })
						.toJSDate(),
			},
			{
				field: "expired",
				headerName: "Wygasł",
				width: 100,
				type: "boolean",
				valueGetter: (_, row) =>
					DateTime.fromISO(row.createdAt).plus({ days: 24 }) <
					DateTime.now(),
			},
			{
				field: "actions",
				headerName: "",
				width: 75,
				type: "actions",
				getActions: (params) => {
					if (viewPoint == "admin") return [];
					return [
						<GridActionsCellItem
							label="Wyślij ponownie"
							showInMenu
							onClick={() =>
								resendMutation.mutate({
									schoolID: params.row.schoolId,
									tokenID: params.row.id,
								})
							}
						/>,
						<GridActionsCellItem
							label="Odnów"
							showInMenu
							onClick={() =>
								renewMutation.mutate({
									schoolID: params.row.schoolId,
									tokenID: params.row.id,
								})
							}
						/>,
						<GridActionsCellItem
							label="Anuluj"
							showInMenu
							onClick={() =>
								cancelMutation.mutate({
									schoolID: params.row.schoolId,
									tokenID: params.row.id,
								})
							}
						/>,
					];
				},
			},
		];

		return result;
	}, []);

	return (
		<>
			<DataGrid
				rows={data ?? []}
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
