import { Button, TextField, Tooltip, Typography } from "@mui/material";
import { Gauge, gaugeClasses } from "@mui/x-charts";
import classes from "./VehiclePartGauge.module.css";
import { c } from "../../modules/utils";
import { DateTime } from "luxon";
import { Check, Close, Edit } from "@mui/icons-material";
import { useContext, useMemo, useState } from "react";
import { AppContext } from "../../App";

interface IProps {
	editable?: boolean;
	className?: string;
	imageSrc: string;
	imageAlt?: string;
	replacedDate?: DateTime;
	lifeSpan?: number;
	name: string;
	onChange?: (newDate: DateTime | null) => void;
}

export default function VehiclePartGauge({
	className,
	imageSrc,
	imageAlt,
	replacedDate,
	editable,
	lifeSpan,
	name,
	onChange,
}: IProps) {
	const [editing, setEditing] = useState(false);
	const [newDate, setNewDate] = useState<DateTime | null>(null);

	const { activeTheme } = useContext(AppContext);

	const usage = useMemo(() => {
		if (!lifeSpan || lifeSpan == 0) return 0;
		const value = Math.abs(
			Math.round(replacedDate?.diffNow(["days"]).days ?? lifeSpan)
		);

		return Math.abs((Math.max(lifeSpan - value, 0) / lifeSpan) * 100);
	}, [replacedDate, lifeSpan]);

	const color = useMemo(() => {
		switch (true) {
			case usage > 75:
				return activeTheme.palette.success.main;
			case usage >= 50:
				return activeTheme.palette.info.main;
			case usage > 25:
				return activeTheme.palette.warning.main;
			default:
				return activeTheme.palette.error.main;
		}
	}, [usage]);

	return (
		<Tooltip title={`Data ostatniej wymiany: ${name}`} placement="top">
			<div
				className={c([
					classes.Wrapper,
					[className!, className != undefined],
				])}
			>
				{lifeSpan && (
					<Gauge
						value={usage}
						startAngle={-110}
						endAngle={110}
						text=""
						sx={() => ({
							[`& .${gaugeClasses.valueArc}`]: {
								fill: color,
							},
						})}
					/>
				)}
				<img src={imageSrc} alt={imageAlt} />

				{editing ? (
					<TextField
						className={classes.Input}
						type="date"
						variant="standard"
						size="small"
						color="secondary"
						value={newDate?.toISODate() ?? ""}
						onChange={(e) => {
							const date = DateTime.fromISO(e.target.value);
							if (date > DateTime.now())
								setNewDate(DateTime.now());
							else setNewDate(date.isValid ? date : null);
						}}
					/>
				) : (
					<Typography variant="overline">
						{replacedDate?.toFormat("dd/LL/yyyy") ?? "-"}
					</Typography>
				)}

				{editable && !editing && (
					<Button
						className={c([
							classes.ActionButton,
							classes.RightButton,
						])}
						color="secondary"
						variant="contained"
						onClick={() => {
							setEditing(true);
							setNewDate(replacedDate ?? null);
						}}
					>
						<Edit />
					</Button>
				)}

				{editing && (
					<>
						<Button
							className={c([
								classes.ActionButton,
								classes.LeftButton,
							])}
							color="error"
							variant="contained"
							onClick={() => setEditing(false)}
						>
							<Close />
						</Button>
						<Button
							className={c([
								classes.ActionButton,
								classes.RightButton,
							])}
							color="success"
							variant="contained"
							onClick={() => {
								onChange && onChange(newDate);
								setEditing(false);
							}}
						>
							<Check />
						</Button>
					</>
				)}
			</div>
		</Tooltip>
	);
}
