import {
	Avatar,
	Button,
	Divider,
	List,
	ListItem,
	ListItemText,
	Typography,
} from "@mui/material";
import classes from "./ProfilePage.module.css";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API } from "../../types/api";
import { callAPI } from "../../modules/utils";
import { useCallback, useContext } from "react";
import { AppContext } from "../../App";
import { DateTimeFormatter, RoleFormatter } from "../../modules/formatters";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";
import MessagePanel from "../../components/MessagePanel/MessagePanel";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { AuthorizabledAccountActions } from "../../modules/enums";
import EditAccountPropertyModal from "../../modals/EditAccountPropertyModal/EditAccountPropertyModal";
import { App } from "../../types/app";
import TransactionsTable from "../../components/TransactionsTable/TransactionsTable";

export default function ProfilePage() {
	const { userDetails, snackBarProps, setModalContent } =
		useContext(AppContext);

	const snackBar = useSnackbar();
	const navigate = useNavigate();
	const qClient = useQueryClient();

	const { data, isFetching, error } = useQuery<
		API.User.Get.IResponse,
		API.User.Get.IEndpoint["error"]
	>({
		queryKey: ["Users", userDetails?.userId],
		queryFn: () =>
			callAPI<API.User.Get.IEndpoint>(
				"GET",
				"/api/v1/auth/users/:userID",
				null,
				{
					userID: userDetails?.userId!,
				}
			),
		retry: true,
		staleTime: 60000,
		enabled: userDetails != null,
	});

	const getPassResetTokenMutation = useMutation<
		API.User.AuthAction.IResponse,
		API.User.AuthAction.IEndpoint["error"]
	>({
		mutationFn: () =>
			callAPI<API.User.AuthAction.IEndpoint>(
				"POST",
				"/api/v1/auth/auth-user-action",
				{ action: AuthorizabledAccountActions.ChangePassword }
			),
		onSuccess: (tokenData) => {
			qClient.invalidateQueries({
				queryKey: ["Users", userDetails?.userId],
			});
			navigate(`/reset-password?token=${tokenData.token}`);
		},
		onError: () =>
			snackBar.enqueueSnackbar({
				...snackBarProps,
				message: "Nie udało się uwierzytelnić tej akcji.",
				variant: "error",
			}),
	});

	const openPropertyEditModal = useCallback(function (
		this: App.UI.AccountProfile.IPropertyEditContext
	) {
		setModalContent(
			<EditAccountPropertyModal {...this} userID={userDetails?.userId!} />
		);
	},
	[]);

	if (isFetching) return <LoadingScreen />;

	if (error || !data)
		return (
			<MessagePanel image="/tangled.svg" caption="Coś poszło nie tak" />
		);

	return (
		<div className={classes.Wrapper}>
			<section className={classes.Headline}>
				<Avatar />
				<Typography variant="h4">
					{data?.name} {data?.surname}
				</Typography>
				<Typography variant="overline">
					{RoleFormatter.format(userDetails?.role)}
				</Typography>
			</section>
			<List className={classes.Properties}>
				<ListItem divider>
					<ListItemText
						primary="Adres email"
						secondary={data?.email}
					/>
				</ListItem>
				<ListItem divider>
					<ListItemText primary="Imię" secondary={data.name} />
					<Button
						color="secondary"
						onClick={openPropertyEditModal.bind({
							propKey: "name",
							label: "Imię",
							type: "text",
							value: data.name,
							minLength: 2,
						})}
					>
						Zmień
					</Button>
				</ListItem>
				<ListItem divider>
					<ListItemText primary="Nazwisko" secondary={data.surname} />
					<Button
						color="secondary"
						onClick={openPropertyEditModal.bind({
							propKey: "surname",
							label: "Nazwisko",
							type: "text",
							value: data.surname,
							minLength: 2,
						})}
					>
						Zmień
					</Button>
				</ListItem>
				<ListItem divider>
					<ListItemText
						primary="Data urodzenia"
						secondary={DateTimeFormatter.format(
							data.birthday,
							"dd/LL/yyyy"
						)}
					/>
					<Button
						color="secondary"
						onClick={openPropertyEditModal.bind({
							propKey: "birthday",
							label: "Data urodzenia",
							type: "date",
							value: data.birthday,
						})}
					>
						Zmień
					</Button>
				</ListItem>
				<ListItem divider>
					<ListItemText
						primary="Dołączono"
						secondary={DateTimeFormatter.format(data?.createdAt)}
					/>
				</ListItem>
				<ListItem divider>
					<ListItemText
						primary="Hasło"
						secondary={`Ostatnio zmieniono ${DateTimeFormatter.format(
							data?.lastPasswordChange
						)}`}
					/>
					<Button
						variant="outlined"
						color="secondary"
						onClick={() => getPassResetTokenMutation.mutate()}
					>
						Zmień
					</Button>
				</ListItem>
				{userDetails?.ownedSchool && (
					<ListItem>
						<ListItemText
							primary="Szkoła"
							secondary={userDetails.ownedSchool.name}
						/>
						<Button
							variant="outlined"
							color="secondary"
							onClick={() =>
								navigate(
									`/schools/${
										userDetails.ownedSchool!.id
									}/manage`
								)
							}
						>
							Zarządzaj
						</Button>
					</ListItem>
				)}
				{userDetails?.instructorProfile && (
					<ListItem>
						<ListItemText
							primary="Zatrudniony"
							secondary={
								userDetails?.instructorProfile?.activeEmployment
									?.schoolName ?? "Nie"
							}
						/>
						{userDetails.instructorProfile.activeEmployment && (
							<Button
								variant="outlined"
								color="secondary"
								onClick={() =>
									navigate(
										`/schools/${
											userDetails.instructorProfile
												?.activeEmployment!.schoolId
										}/manage`
									)
								}
							>
								Zobacz
							</Button>
						)}
					</ListItem>
				)}

				{userDetails?.role == "Administrator" && (
					<ListItem>
						<ListItemText primary="Panel administratora" />
						<Button
							variant="outlined"
							color="secondary"
							onClick={() => navigate("/panel")}
						>
							Przejdź
						</Button>
					</ListItem>
				)}
			</List>
			<section className={classes.AdditionalData}>
				{userDetails?.role == "Student" && (
					<div>
						<Typography variant="h6" gutterBottom>
							Moje transakcje
						</Typography>
						<Divider className={classes.Divider} />
						<TransactionsTable
							userID={userDetails.userId}
							supportFilter={false}
						/>
					</div>
				)}
			</section>
		</div>
	);
}
