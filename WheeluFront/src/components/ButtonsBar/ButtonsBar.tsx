import { c } from "../../modules/utils";
import classes from "./ButtonsBar.module.css";

interface IProps {
	className?: string;
	children: React.ReactNode;
}

export default function ButtonsBar({ className, children }: IProps) {
	return (
		<div
			className={c([
				classes.Container,
				[className!, className != undefined],
			])}
		>
			{children}
		</div>
	);
}
