import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API } from "../../../types/api";
import { callAPI } from "../../../modules/utils";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Alert, Fab, Paper, Snackbar, SwipeableDrawer, useMediaQuery } from "@mui/material";

import classes from "./ResolveApplication.module.css";
import { AppContext } from "../../../App";
import ApplicationSummary, { IApplicationSummaryProps } from "../components/ApplicationSummary/ApplicationSummary";
import { useNavigate, useParams } from "react-router-dom";
import ResolveApplicationForm from "../components/ResolveApplicationForm/ResolveApplicationForm";
import { CheckOutlined } from "@mui/icons-material";
import LoadingScreen from "../../../components/LoadingScreen/LoadingScreen";
import SchoolApplicationService from "../../../services/SchoolApplication";
import { App } from "../../../types/app";
import EntityNotFound from "../components/EntityNotFound/EntityNotFound";

export default function ResolveApplication() {
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [snackBarOpened, setSnackBarOpened] = useState(false);
	const [submitError, setSubmitError] = useState<API.Application.ResolveErrorCodes | null>(null);

	const [formState, setFormState] = useState<API.Application.Accept.IRequestData | null>(null);
	const [isFormSafe, setIsFormSafe] = useState(false);

	const {darkTheme} = useContext(AppContext);
	const qClient = useQueryClient();
	const navigate = useNavigate();
	const params = useParams();

	const isDesktop = useMediaQuery(darkTheme.breakpoints.up("md"));

	const {data: applicationData, error} = useQuery<API.Application.Get.IResponse, API.Application.Get.IEndpoint["error"]>({
		queryKey: ["Applications", "#", params["id"]],
		queryFn: ()=>callAPI<API.Application.Get.IEndpoint>("GET","/api/v1/applications/:id", null, {id: params["id"] ?? ""}),
        retry: false,
		staleTime: 60000,
	});

	const {data: cityOptions} = useQuery<API.City.GetAll.IResponse, API.City.GetAll.IEndpoint["error"]>({
        queryKey: ["Cities"],
        queryFn: ()=>callAPI<API.City.GetAll.IEndpoint>("GET","/api/v1/cities"),
        retry: true,
		staleTime: 60000
    });

	const {data: stateOptions} = useQuery<API.State.GetAll.IResponse, API.State.GetAll.IEndpoint["error"]>({
        queryKey: ["States"],
        queryFn: ()=>callAPI<API.State.GetAll.IEndpoint>("GET","/api/v1/states"),
        retry: true,
		staleTime: Infinity
    });

	const acceptMutation = useMutation<null, API.Application.Accept.IEndpoint["error"], API.Application.Accept.IRequestData>({
        mutationFn: data=>callAPI<API.Application.Accept.IEndpoint>("POST","/api/v1/applications/:id",data, {id: params["id"] ?? ""}),
        onSuccess: async ()=>{
			qClient.invalidateQueries({queryKey: ["Applications"]});
			navigate("/panel/applications");
		},
		onError: (err=>{
			setDrawerOpen(false);
			setSubmitError(err.code);
			setSnackBarOpened(true);
		})
    });

	const rejectMutation = useMutation<null, API.Application.Reject.IEndpoint["error"], API.Application.Reject.IRequestData>({
        mutationFn: data=>callAPI<API.Application.Reject.IEndpoint>("DELETE","/api/v1/applications/:id",data, {id: params["id"] ?? "" }),
        onSuccess: ()=>{
			qClient.invalidateQueries({queryKey: ["Applications"]});
			navigate("/panel/applications");
		},
		onError: (err=>{
			setDrawerOpen(false);
			setSnackBarOpened(true);
			setSubmitError(err.code);
		})
    });

	const onFormChange = useCallback((data: App.Models.IApplication, cities: App.Models.ICityMatching[])=>{

		const result: API.Application.Accept.IRequestData["NearbyCities"] = cities.map(data=>{
			return {
				Id: data.identifier?.toString(),
				Name: data.cityName,
				State: data.state
			}
		});

		setFormState({
			SchoolName: data.schoolName,
			Nip: data.nip,
			OwnerName: data.ownerName,
			OwnerSurname: data.ownerSurname,
			OwnerBirthday: data.ownerBirthday,
			EstablishedDate: data.establishedDate,
			Street: data.street,
			BuildingNumber: data.buildingNumber,
			SubBuildingNumber: data.subBuildingNumber,
			ZipCode: data.zipCode,
			City: data.city,
			State: data.state,
			NearbyCities: result,
			Email: data.email,
			PhoneNumber: data.phoneNumber
		});
	},[]);

	useEffect(()=>setDrawerOpen(false), [isDesktop]);

	const summaryProps: IApplicationSummaryProps = useMemo(()=>{
		const data = applicationData?
		{
			schoolName: applicationData.schoolName,
			ownerFullName: `${applicationData.ownerName} ${applicationData.ownerSurname}`,
			phoneNumber: applicationData.phoneNumber,
			email: applicationData.email,
		}:undefined

		return {
			data,
			onConfirm: (outcome)=>{
				if(outcome.action=="reject") {
					rejectMutation.mutate({
						Reason: outcome.rejectionReason,
						Message: outcome.message
					});

					return;
				}
				
				if(!isFormSafe||!formState) return;

				acceptMutation.mutate(formState);
			},
			disableActions: rejectMutation.isPending || acceptMutation.isPending
		}
	},[formState, applicationData, isFormSafe]);

	useEffect(()=>{
		if(error&&error.status!=404)
			setSnackBarOpened(true);
	}, [error]);

	if(error?.status==404) return <EntityNotFound />;

	return (
		<section className={classes.ContentWrapper}>

			{
				applicationData&&cityOptions&&stateOptions?
					<ResolveApplicationForm data={applicationData} cities={cityOptions} states={stateOptions} onUpdate={onFormChange} onChange={setIsFormSafe} />
				:
					<LoadingScreen />
			}


			<div className={classes.Aside}>
				<Paper>
					<ApplicationSummary {...summaryProps} />
				</Paper>
			</div>


			<SwipeableDrawer 
				variant="temporary"
				classes={{ paper: classes.Drawer }}
				ModalProps={{keepMounted: true}} 
				onClose={()=>setDrawerOpen(false)} 
				onOpen={()=>{}} 
				open={drawerOpen&&!isDesktop}
				anchor="bottom"
				disableSwipeToOpen={true}
			>
				<span className={classes.Handle}></span>
				<ApplicationSummary {...summaryProps} />
			</SwipeableDrawer>

			<Fab className={classes.OpenDrawerButton} color="secondary" onClick={()=>setDrawerOpen(true)}>
				<CheckOutlined />
			</Fab>
			<Snackbar open={snackBarOpened} autoHideDuration={4000} anchorOrigin={{vertical: "bottom", horizontal: "right"}} onClose={()=>setSnackBarOpened(false)}>
				<Alert
					severity="error"
					variant="filled"
					sx={{ width: '100%' }}
				>
					Nie mogliśmy przetworzyć tego żądania. {SchoolApplicationService.translateApplicationResolveErrorCode(submitError ?? "InternalError")}
				</Alert>
			</Snackbar>
		</section>
	)
}
