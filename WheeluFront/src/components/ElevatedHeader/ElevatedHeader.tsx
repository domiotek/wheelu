import { SxProps } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import useScrollTrigger from "@mui/material/useScrollTrigger";

interface IProps {
	children?: JSX.Element | JSX.Element[];
	className?: string;
	sx?: SxProps;
	scrollerRef?: Node | Window;
	elevation?: number;
}

export default function ElevatedHeader({
	className,
	children,
	sx,
	scrollerRef,
	elevation,
}: IProps) {
	const trigger = useScrollTrigger({
		disableHysteresis: true,
		threshold: 0,
		target: scrollerRef ?? window,
	});

	return (
		<>
			<Toolbar className={className} />
			<AppBar
				className={className}
				elevation={trigger ? elevation ?? 4 : 0}
				sx={sx}
			>
				{children}
			</AppBar>
		</>
	);
}
