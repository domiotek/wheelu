import { Circle } from "@mui/icons-material";

interface IProps {
	color?:
		| "disabled"
		| "action"
		| "inherit"
		| "secondary"
		| "primary"
		| "error"
		| "info"
		| "success"
		| "warning";
}

export default function InlineDot({ color }: IProps) {
	return (
		<Circle sx={{ fontSize: "0.65em", ml: 0.5, mr: 0.5 }} color={color} />
	);
}
