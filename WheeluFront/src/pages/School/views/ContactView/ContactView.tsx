import {
	CircularProgress,
	Container,
	Divider,
	Link,
	List,
	ListItem,
	ListItemText,
	Typography,
} from "@mui/material";
import classes from "./ContactView.module.css";
import commonClasses from "../Common.module.css";
import { useContext, useState } from "react";
import { PublicSchooPageContext } from "../../SchoolPage.tsx";
import { c, formatAddress } from "../../../../modules/utils.tsx";
import { AppContext } from "../../../../App.tsx";
import { Email, Phone } from "@mui/icons-material";

export default function ContactView() {
	const [mapLoaded, setMapLoaded] = useState(false);

	const { activeTheme, activeThemeName } = useContext(AppContext);
	const { schoolData } = useContext(PublicSchooPageContext);

	return (
		<div className={commonClasses.ViewContainer}>
			<Typography variant="h5" gutterBottom>
				Kontakt
			</Typography>
			<Divider />

			<div className={classes.Wrapper}>
				<div className={classes.MapWrapper}>
					<iframe
						src={`https://maps.google.com/maps?q=${encodeURIComponent(
							formatAddress(schoolData!.address)
						)}&output=embed`}
						title="Lokalizacja placówki"
						onLoad={() => setMapLoaded(true)}
					/>
					{!mapLoaded && (
						<Container
							className={classes.LoadingView}
							sx={{
								bgcolor:
									activeTheme.palette.grey[
										activeThemeName == "light" ? 200 : 900
									],
							}}
						>
							<CircularProgress variant="indeterminate" />
						</Container>
					)}
				</div>

				<List>
					<ListItem divider>
						<ListItemText
							primary="Adres"
							secondary={formatAddress(schoolData!.address)}
						/>
					</ListItem>
					<ListItem divider>
						<ListItemText
							primary="Numer telefonu"
							secondary={
								<Link
									href={`tel:${schoolData?.phoneNumber}`}
									sx={{
										color: (theme) =>
											theme.palette.text.primary,
										textDecorationColor: (theme) =>
											theme.palette.text.primary,
									}}
								>
									<Phone fontSize="small" color="primary" />
									{schoolData?.phoneNumber}
								</Link>
							}
						/>
					</ListItem>
					<ListItem divider>
						<ListItemText
							primary="Email"
							secondary={
								<Link
									href={`mailto:${schoolData?.email}`}
									sx={{
										color: (theme) =>
											theme.palette.text.primary,
										textDecorationColor: (theme) =>
											theme.palette.text.primary,
									}}
								>
									<Email fontSize="small" color="primary" />
									{schoolData?.email}
								</Link>
							}
						/>
					</ListItem>
				</List>
			</div>
		</div>
	);
}
