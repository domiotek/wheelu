import { SxProps } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import { useEffect } from 'react';

interface IProps {
	children?: JSX.Element | JSX.Element[]
	className?: string
	sx?: SxProps
}


export default function ElevatedHeader({className, children, sx}: IProps) {

	const trigger = useScrollTrigger({
		disableHysteresis: true,
		threshold: 0,
		target: window
	});
	
	useEffect(()=>{
		console.log(trigger);
	},[trigger]);

	return (
		<>
			<Toolbar className={className} />
			<AppBar className={className} elevation={trigger?4:0} sx={sx}>
				{children}
			</AppBar>
		</>
		
	);
}
