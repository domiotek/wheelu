import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { API } from '../../../../types/api';
import { callAPI } from '../../../../modules/utils';
import { App } from '../../../../types/app';
import { DEFAULT_TABLE_PAGE_SIZE, TABLE_PAGE_SIZE_OPTIONS } from '../../constants';

interface IProps {
	supportFilter?: boolean
}

export default function UsersTable({supportFilter}: IProps) {
	const [paginationModel, setPaginationModel] = useState({
		pageSize: DEFAULT_TABLE_PAGE_SIZE,
		page: 0,
	});

	const {data, isFetching} = useQuery<API.User.GetMany.IResponse, API.User.GetMany.IEndpoint["error"]>({
        queryKey: ["Users"].concat(supportFilter?[]:[paginationModel.pageSize.toString(), paginationModel.page.toString()]),
        queryFn: ()=>callAPI<API.User.GetMany.IEndpoint>("GET","/api/v1/auth/users",
			{
				PageNumber: supportFilter?undefined:paginationModel.page, 
				PagingSize: supportFilter?undefined:paginationModel.pageSize
			}),
        retry: true,
		staleTime: 60000
    });

	const columns = useMemo(()=>{
		const result: GridColDef<App.Models.IUser>[] = [
			{field: "id", headerName: "ID", width: 300, type: "number"},
			{field: "email", headerName: "Email", width: 250, type: "string"},
			{field: "name", headerName: "Imię", width: 150, type: "string"},
			{field: "surname", headerName: "Nazwisko", width: 150, type: "string"},
			{field: "role", headerName: "Rola", width: 125, type: "string"},
			{field: "birthday", headerName: "Data urodzenia", width: 175, type:"date", valueGetter: (value=>new Date(value))},
			{field: "createdAt", headerName: "Dołączono", width: 200, type: "dateTime", valueGetter: (value=>new Date(value))},
			{field: "isActivated", headerName: "Aktywowany", width: 175, type: "boolean"},
			{field: "lastPasswordChange", headerName: "Ostatnia zmiana hasła", width: 250, type: "dateTime", valueGetter: (value=>new Date(value))}
		]

		return result;
	}, []);

	return (
		<>
			<DataGrid
				rows={data?.entries ?? []}
				paginationMode={supportFilter?"client":"server"}
				columns={columns}
				pageSizeOptions={TABLE_PAGE_SIZE_OPTIONS}
				paginationModel={paginationModel}
				onPaginationModelChange={setPaginationModel}
				loading={isFetching}
				autoHeight={true}
				rowCount={supportFilter?undefined:data?.totalCount ?? 0}
				disableColumnFilter={!supportFilter}
				initialState={{
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
