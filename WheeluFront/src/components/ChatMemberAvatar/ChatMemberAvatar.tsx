import { Avatar, Badge } from "@mui/material";
import InlineDot from "../InlineDot/InlineDot";
import classes from "./ChatMemberAvatar.module.css";
import AuthService from "../../services/Auth";
import { initialsAvatarProps } from "../../modules/features";
import { useMemo } from "react";
import { DateTime } from "luxon";
import { c } from "../../modules/utils";

interface IProps {
	conversation: App.Models.IConversation;
}

export default function ChatMemberAvatar({ conversation }: IProps) {
	const isOtherPartyActive = useMemo(() => {
		const lastSeenDate = DateTime.fromISO(conversation.otherPartyLastSeen);
		return Math.abs(lastSeenDate.diffNow("minutes").minutes) < 5;
	}, [conversation]);

	return (
		<>
			<Badge
				overlap="circular"
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "right",
				}}
				badgeContent={
					<InlineDot
						className={c([
							classes.ActivityStatus,
							[classes.Hidden, !isOtherPartyActive],
						])}
						color="success"
					/>
				}
			>
				<Avatar
					{...initialsAvatarProps(
						AuthService.getUserFullName(conversation.otherParty)
					)}
				/>
			</Badge>
		</>
	);
}
