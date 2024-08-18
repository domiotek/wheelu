import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid'
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { API } from '../../../../types/api';
import { callAPI } from '../../../../modules/utils';
import { App } from '../../../../types/app';
import SchoolApplicationService from '../../../../services/SchoolApplication';

export default function ApplicationsTable() {
	const [paginationModel, setPaginationModel] = useState({
		pageSize: 25,
		page: 0,
	});

	const {data, isFetching} = useQuery<API.Application.GetAll.IResponse, API.Application.GetAll.IEndpoint["error"]>({
        queryKey: ["Applications", paginationModel.pageSize, paginationModel.page],
        queryFn: ()=>callAPI<API.Application.GetAll.IEndpoint>("GET","/api/v1/applications",{PageNumber: paginationModel.page, PagingSize: paginationModel.pageSize}),
        retry: true,
		staleTime: 60000
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
			{field: "resolvedAt", headerName: "Data rozpatrzenia", width: 250, type: "custom", valueGetter: (value=>value!=undefined?new Date(value):"Nie rozpatrzono")},
			{field: "actions", headerName: "Akcje", renderHeader: ()=>"", type: "actions", flex: 1, align: 'right', getActions: params=>{
				return [
					<GridActionsCellItem label="Rozpatrz" showInMenu />,
					<GridActionsCellItem label="Odrzuć" showInMenu />,
				]
			}}
		]

		return result;
	}, []);

	return (
		<DataGrid
			rows={data?.entries ?? []}
			paginationMode='server'
			columns={columns}
			pageSizeOptions={[15, 25, 35, 50, 75, 100]}
			paginationModel={paginationModel}
			onPaginationModelChange={setPaginationModel}
			loading={isFetching}
			autoHeight={true}
			rowCount={data?.totalCount ?? 0}
			disableColumnFilter={true}
		/>
	)
}
