import { ExitToApp } from "@mui/icons-material";
import { Avatar, Card, Collapse, Divider, List, ListItemButton, ListItemIcon, ListItemText, Paper, Stack, Typography } from "@mui/material";
import { MouseEvent, useCallback, useEffect, useRef, useState } from "react";

interface IProps {
	open: boolean
	setOpen: (state: boolean)=>void
}

export default function AccountPanel({open, setOpen}: IProps) {
	const anchorRef = useRef<HTMLDivElement>(null);

	const [menuOpen, setMenuOpen] = useState(false);


	const menuOpenHandler = useCallback((e: MouseEvent<HTMLDivElement>)=>{
		e.stopPropagation();
		setMenuOpen(!menuOpen);
		setOpen(!menuOpen);
	},[menuOpen]);

	useEffect(()=>{
		setMenuOpen(open);
	},[open]);

	return (
		<Card sx={{m: 1, p: 1}}>
			<Stack ref={anchorRef} direction="row" onClick={menuOpenHandler}>
				<Avatar />
				<Stack sx={{ml: 2}}>
					<Typography variant="body1">Test Account</Typography>
					<Typography variant="caption">Student</Typography>
				</Stack>
			</Stack>
			<Collapse in={menuOpen}>
				<Paper>
					<List>
						<ListItemButton>
							<ListItemIcon />
							<ListItemText>
								Profile
							</ListItemText>
						</ListItemButton>

						<Divider />

						<ListItemButton>
							<ListItemIcon>
								<ExitToApp />
							</ListItemIcon>
							<ListItemText>
								Log out
							</ListItemText>
						</ListItemButton>
					</List>
				</Paper>
			</Collapse>
		</Card>
	)
}
