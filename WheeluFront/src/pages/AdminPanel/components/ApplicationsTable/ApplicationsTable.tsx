import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { API } from '../../../../types/api';
import { callAPI } from '../../../../modules/utils';
import { App } from '../../../../types/app';
import SchoolApplicationService from '../../../../services/SchoolApplication';
import { Alert, Snackbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface IProps {
	supportFilter?: boolean
}


export default function ApplicationsTable({supportFilter}: IProps) {
	const [paginationModel, setPaginationModel] = useState({
		pageSize: 25,
		page: 0,
	});

	const [snackBarOpened, setSnackBarOpened] = useState(false);

	const qClient = useQueryClient();
	const navigate = useNavigate();

	const {data, isFetching} = useQuery<API.Application.GetAll.IResponse, API.Application.GetAll.IEndpoint["error"]>({
        queryKey: ["Applications"].concat(supportFilter?[]:[paginationModel.pageSize.toString(), paginationModel.page.toString()]),
        queryFn: ()=>callAPI<API.Application.GetAll.IEndpoint>("GET","/api/v1/applications",
			{
				PageNumber: supportFilter?undefined:paginationModel.page, 
				PagingSize: supportFilter?undefined:paginationModel.pageSize
			}),
        retry: true,
		staleTime: 60000
    });

	const quickRejectMutation = useMutation<null, API.Application.Reject.IEndpoint["error"], API.Application.Reject.IRequestData & {id: string}>({
        mutationFn: data=>callAPI<API.Application.Reject.IEndpoint>("DELETE","/api/v1/applications/:id",data, {id: data.id }, true),
        onSuccess: async ()=>qClient.invalidateQueries({queryKey: ["Applications"]}),
		onError: (()=>setSnackBarOpened(true))
    });

	const columns = useMemo(()=>{
		const result: GridColDef<App.Models.IApplication>[] = [
			{field: "id", headerName: "ID", width: 35, type: "number"},
			{field: "status", headerName: "Status", width: 120, type: "string", valueGetter: (value)=>SchoolApplicationService.translateApplicationStatus(value)},
			{field: "nip", headerName: "NIP", width: 125, type: "number", headerAlign: "left"},
			{field: "schoolName", headerName: "Nazwa szkoły", width: 150, type: "string"},
			{field: "owner", headerName: "Właściciel", width: 150, valueGetter: (_value, row)=>{
				return `${row.ownerName} ${row.ownerSurname}`;
			}},
			{field: "address", headerName: "Adres", width: 250, valueGetter: (_value, row)=>{
				return `${row.street} ${row.buildingNumber}${row.subBuildingNumber ?? 0 > 0?`/${row.subBuildingNumber}`:""}, ${row.zipCode} ${row.city}(${row.state})`
			}},
			{field: "appliedAt", headerName: "Data złożenia", width: 250, type: "dateTime", valueGetter: (value=>new Date(value))},
			{field: "resolvedAt", headerName: "Data rozpatrzenia", width: 250, type: "dateTime", valueGetter: (value=>value!=undefined?new Date(value):undefined)},
			{field: "rejectionReason", headerName: "Powód odrzucenia", width: 120, type: "string"},
			{field: "rejectionMessage", headerName: "Opis odrzucenia", width: 240, type: "string"},
			{field: "actions", headerName: "Akcje", renderHeader: ()=>"", type: "actions", flex: 1, align: 'right', getActions: params=>{
				let actions = [
					<GridActionsCellItem 
						label="Zadzwoń"
						showInMenu
						onClick={()=>window.location.href = `tel:${params.row.phoneNumber}`}
					/>,
					<GridActionsCellItem 
						label="Napisz email" 
						showInMenu
						onClick={()=>window.location.href = `mailto:${params.row.email}`}
					/>
				];


				if(params.row.status=="pending")
					actions = actions.concat([
						<GridActionsCellItem 
							label="Rozpatrz"
							showInMenu
							onClick={()=>navigate(`/panel/applications/${params.id}`)}
						/>,
						<GridActionsCellItem
							label="Odrzuć"
							showInMenu
							onClick={()=>quickRejectMutation.mutate({Reason: "Unspecified", id: params.row.id?.toString() ?? ""})}
						/>,
					]);

				return actions;
			}}
		]

		return result;
	}, []);

	return (
		<>
			<DataGrid
				rows={data?.entries ?? []}
				paginationMode={supportFilter?"client":"server"}
				columns={columns}
				pageSizeOptions={[15, 25, 35, 50, 75, 100]}
				paginationModel={paginationModel}
				onPaginationModelChange={setPaginationModel}
				loading={isFetching || quickRejectMutation.isPending}
				autoHeight={true}
				rowCount={supportFilter?undefined:data?.totalCount ?? 0}
				disableColumnFilter={!supportFilter}
				initialState={{
					columns: {
						columnVisibilityModel: {
							"rejectionReason": false,
							"rejectionMessage": false
						},
					},
					sorting: {
						sortModel: [{
							field: "id",
							sort: "asc"
						}]
					}
				}}
			/>

			<Snackbar open={snackBarOpened} autoHideDuration={4000} anchorOrigin={{vertical: "bottom", horizontal: "right"}} onClose={()=>setSnackBarOpened(false)}>
				<Alert
					severity="error"
					variant="filled"
					sx={{ width: '100%' }}
				>
					Nie udało się odrzucić wniosku.
				</Alert>
			</Snackbar>
		</>
	)
}
