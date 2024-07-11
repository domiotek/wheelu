import { SxProps } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import useScrollTrigger from '@mui/material/useScrollTrigger';

interface IProps {
	children?: JSX.Element | JSX.Element[]
	sx?: SxProps
}


export default function ElevatedHeader({children, sx}: IProps) {

	const trigger = useScrollTrigger({
		disableHysteresis: true,
		threshold: 0,
		target: window
	});
	
	return (
		<AppBar elevation={trigger?4:0} sx={sx}>
			<Toolbar>
				{children}
			</Toolbar>
		</AppBar>
	);
}
