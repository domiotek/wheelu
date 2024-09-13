import { ExitToApp } from "@mui/icons-material";
import {
	Avatar,
	Card,
	Collapse,
	Divider,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Paper,
	Stack,
	Typography,
} from "@mui/material";
import {
	MouseEvent,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../App";
import { RoleFormatter } from "../../modules/formatters";

interface IProps {
	open: boolean;
	setOpen: (state: boolean) => void;
}

export default function AccountPanel({ open, setOpen }: IProps) {
	const anchorRef = useRef<HTMLDivElement>(null);

	const [menuOpen, setMenuOpen] = useState(false);

	const navigate = useNavigate();

	const { userDetails } = useContext(AppContext);

	const menuOpenHandler = useCallback(
		(e: MouseEvent<HTMLDivElement>) => {
			e.stopPropagation();
			setMenuOpen(!menuOpen);
			setOpen(!menuOpen);
		},
		[menuOpen]
	);

	useEffect(() => {
		setMenuOpen(open);
	}, [open]);

	return (
		<Card sx={{ m: 1, p: 1 }}>
			<Stack ref={anchorRef} direction="row" onClick={menuOpenHandler}>
				<Avatar />
				<Stack sx={{ ml: 2 }}>
					<Typography variant="body1">
						{userDetails?.name} {userDetails?.surname}
					</Typography>
					<Typography variant="caption">
						{RoleFormatter.format(userDetails?.role)}
					</Typography>
				</Stack>
			</Stack>
			<Collapse in={menuOpen}>
				<Paper>
					<List>
						<ListItemButton>
							<ListItemIcon />
							<ListItemText>Profile</ListItemText>
						</ListItemButton>

						<Divider />

						<ListItemButton onClick={() => navigate("/logout")}>
							<ListItemIcon>
								<ExitToApp />
							</ListItemIcon>
							<ListItemText>Log out</ListItemText>
						</ListItemButton>
					</List>
				</Paper>
			</Collapse>
		</Card>
	);
}
