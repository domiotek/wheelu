import { Button, Card, CardContent, CardHeader, Collapse, Divider, Skeleton, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import classes from "./ApplicationSummary.module.css";
import { Mail, Phone } from '@mui/icons-material';
import { useMemo, useState } from 'react';
import { c } from '../../../../modules/utils';
import { useNavigate } from 'react-router-dom';
import { App } from '../../../../types/app';

interface IPositiveOutcome {
	action: "accept"
}

interface INegativeOutcome {
	action: "reject"
	rejectionReason: App.Models.ApplicationRejectionReason
	message?: string
}

export interface IApplicationSummaryProps {
	data?: {
		schoolName: string
		ownerFullName: string
		phoneNumber: string
		email: string
	}
	onConfirm: (outcome: IPositiveOutcome | INegativeOutcome)=>void
	disableActions?: boolean
}

export default function ApplicationSummary({data, onConfirm, disableActions}: IApplicationSummaryProps) {
	const [decision, setDecision] = useState<"accept" | "reject" | undefined>();
	const [rejectReason, setRejectReason] = useState<App.Models.ApplicationRejectionReason>("Unspecified");
	const [message, setMessage] = useState<string>("");

	const navigate = useNavigate();

	const confirm = ()=>{
		if(decision=="accept") onConfirm({action: "accept"});
		else onConfirm({
			action: "reject",
			rejectionReason: rejectReason,
			message: message!=""?message:undefined
		})
	}

	const rejectionReasons = useMemo(()=>{

		const options: Map<App.Models.ApplicationRejectionReason, string> = new Map(
			[
				["BadReputation","Negatywna reputacja"],
				["InvalidData", "Niewłaściwe dane"], 
				["PlatformSaturated", "Platforma przepełniona"], 
				["Unspecified", "Nieokreślony"]
			]
		);

		return Array.from(options.entries()).map(elem=><option key={elem[0]} value={elem[0]}>{elem[1]}</option>);
	},[]);

	return (
		<Card className={classes.Host} elevation={0}>
			<CardHeader title={data?.schoolName ?? <Skeleton />}/>
			<Divider />
			<CardContent>
				<div className={classes.OwnerSection}>
					<Typography variant='h6'>{data?.ownerFullName ?? <Skeleton />}</Typography>
					<div className={classes.ActionsWrapper}>
						<Button variant="contained" size='small' color='secondary' href={`tel:${data?.phoneNumber}`} disabled={data==undefined||disableActions}><Phone /></Button>
						<Button variant="contained" size='small' color='secondary' href={`mailto:${data?.email}`}  disabled={data==undefined||disableActions}><Mail /></Button>
					</div>
				</div>
				<Divider />
				<div className={classes.ResolveSection}>
					<ToggleButtonGroup
						value={decision}
						exclusive
						onChange={(_ev, val)=>setDecision(val)}
						disabled={data==undefined||disableActions}
					>
						<ToggleButton value="accept" color='success'>
							Zaakceptuj
						</ToggleButton>
						<ToggleButton value="reject" color='error'>
							Odrzuć
						</ToggleButton>
					</ToggleButtonGroup>

					<Collapse classes={{wrapperInner: classes.RejectionDetails}} in={decision=="reject"}>
						<TextField
							select
							label="Powód"
							SelectProps={{
								native: true,
							}}
							value={rejectReason}
							onChange={ev=>setRejectReason(ev.target.value as any)}
						>
							{rejectionReasons}
						</TextField>
						<TextField
							label="Dodatkowa wiadomość"
							multiline
							maxRows={3}
							value={message}
							onChange={ev=>setMessage(ev.target.value)}
						/>
					</Collapse>
					
					<div className={c([classes.ActionsWrapper, classes.RightAligned])}>
						<Button size='small' onClick={()=>navigate("/panel/applications")}>Anuluj</Button>
						<Button variant='contained' disabled={decision==undefined||disableActions} onClick={confirm}>Zatwierdź</Button>
					</div>

				</div>
			</CardContent>
		</Card>
	)
}
