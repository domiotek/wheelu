import { Home } from "@mui/icons-material";
import { Chip, Link, Typography } from "@mui/material";
import { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import { CourseCategory } from "./enums";
import { CourseCategoriesMapping } from "./constants";
import ConfirmModal from "../modals/ConfirmModal/ConfirmModal";

interface IProps {
	rootLink: string;
}

export interface ILevelLeaf {
	id: string;
	label: string;
	link: string;
}

type ILevel = Map<string, ILevelLeaf[]>;

export function RenderBreadcrumbs(
	pathName: string,
	{ rootLink }: IProps,
	firstLevel: ILevelLeaf[],
	...levels: ILevel[]
) {
	const result: JSX.Element[] = [];

	const BuildLink = (label: ReactNode, link: string) => {
		return (
			<Link
				key={link}
				component={RouterLink}
				sx={{ display: "flex" }}
				underline="hover"
				color="inherit"
				to={link}
			>
				{label}
			</Link>
		);
	};

	const BuildLabel = (label: ReactNode, key: string) => {
		return (
			<Typography key={key} color="text.primary">
				{label}
			</Typography>
		);
	};

	if (location.pathname == rootLink)
		result.push(BuildLabel(<Home />, "root"));
	else result.push(BuildLink(<Home />, rootLink));

	const parts = pathName.substring(1).split("/").splice(1);

	let prevSegment = "root";
	let prevLink = rootLink;

	for (let i = 0; i < parts.length; i++) {
		const part = parts[i];
		const isLast = i == parts.length - 1;

		const source =
			prevSegment == "root"
				? firstLevel
				: levels[i - 1]?.get(prevSegment);

		if (!source) return result;

		const nextSegment =
			source.find((leaf) => leaf.id == part) ??
			source.find((leaf) => leaf.id == "index");

		if (!nextSegment) return result;

		prevLink = `${prevLink}/${nextSegment.link}`;

		if (isLast) result.push(BuildLabel(nextSegment.label, nextSegment.id));
		else result.push(BuildLink(nextSegment.label, prevLink));

		prevSegment = part;
	}

	return result;
}

export function initialsAvatarProps(name: string) {
	return {
		children: `${name.split(" ")[0][0]}${name.split(" ")[1][0]}`,
	};
}

export function renderCategoryChips(enabledCategories: CourseCategory[]) {
	return CourseCategoriesMapping.filter((cat) =>
		enabledCategories.includes(cat.id)
	).map((category) => {
		return (
			<Chip
				key={category.id}
				label={category.name}
				size="small"
				color="secondary"
				sx={{ ml: "0.15em", mr: "0.15em" }}
			/>
		);
	});
}

export async function getBackendImageSrc(url: string): Promise<string> {
	if (process.env.NODE_ENV == "production") return url;

	try {
		const source = await new Promise<string>((resolve) => {
			fetch(url, {
				headers: {
					"ngrok-skip-browser-warning": "true",
				},
			})
				.then((response) => response.blob())
				.then((blob) => resolve(URL.createObjectURL(blob)));
		});
		return source;
	} catch (error) {
		return "";
	}
}

interface IConfirmationOptios {
	header: string;
	message: string;
	cancelCaption?: string;
	confirmCaption?: string;
}

export async function GetUserConfirmation(
	modalSetter: (content: JSX.Element) => void,
	options: IConfirmationOptios
) {
	return new Promise<boolean>((res) => {
		modalSetter(
			<ConfirmModal
				header={options.header}
				message={options.message}
				cancelButtonCaption={options.cancelCaption}
				confirmButtonCaption={options.confirmCaption}
				onDecision={(decision: boolean) => res(decision)}
			/>
		);
	});
}
