import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid'
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { API } from '../../../../types/api';
import { callAPI } from '../../../../modules/utils';
import { App } from '../../../../types/app';

interface IProps {
	supportFilter?: boolean
}


export default function SchoolsTable({supportFilter}: IProps) {
	const [paginationModel, setPaginationModel] = useState({
		pageSize: 25,
		page: 0,
	});

	const {data, isFetching} = useQuery<API.School.GetAll.IResponse, API.School.GetAll.IEndpoint["error"]>({
        queryKey: ["Schools"].concat(supportFilter?[]:[paginationModel.pageSize.toString(), paginationModel.page.toString()]),
        queryFn: ()=>callAPI<API.School.GetAll.IEndpoint>("GET","/api/v1/schools",
			{
				PageNumber: supportFilter?undefined:paginationModel.page, 
				PagingSize: supportFilter?undefined:paginationModel.pageSize
			}),
        retry: true,
		staleTime: 60000
    });

	const columns = useMemo(()=>{
		const result: GridColDef<App.Models.ISchool>[] = [
			{field: "id", headerName: "ID", width: 35, type: "number"},
			{field: "nip", headerName: "NIP", width: 125, type: "number", headerAlign: "left"},
			{field: "name", headerName: "Nazwa szkoły", width: 150, type: "string"},
			{field: "description", headerName: "Opis", width: 250, type: "string"},
			{field: "owner", headerName: "Właściciel", width: 150, valueGetter: (_value, row)=>{
				return `${row.owner.name} ${row.owner.surname}`;
			}},
			{field: "address", headerName: "Adres", width: 250, valueGetter: (_value, row)=>{
				return `${row.address.street} ${row.address.buildingNumber}${row.address.subBuildingNumber ?? 0 > 0?`/${row.address.subBuildingNumber}`:""}, ${row.address.zipCode} ${row.address.city}(${row.address.state})`
			}},
			{field: "joined", headerName: "Data dołączenia", width: 250, type: "dateTime", valueGetter: (value=>new Date(value))},
			{field: "established", headerName: "Data założenia", width: 250, type: "dateTime", valueGetter: (value=>new Date(value))},
			{field: "actions", headerName: "Akcje", renderHeader: ()=>"", type: "actions", flex: 1, align: 'right', getActions: params=>{
				return [
					<GridActionsCellItem 
						label="Zadzwoń"
						showInMenu
						onClick={()=>window.location.href = `tel:${params.row.phoneNumber}`}
					/>
				];
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
				loading={isFetching}
				autoHeight={true}
				rowCount={supportFilter?undefined:data?.totalCount ?? 0}
				disableColumnFilter={!supportFilter}
				initialState={{
					columns: {
						columnVisibilityModel: {
							"description": false
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
		</>
	)
}
