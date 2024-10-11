import {
	ButtonBase,
	Card,
	CardContent,
	Fade,
	MenuItem,
	Pagination,
	TextField,
	Typography,
} from "@mui/material";
import InlineDot from "../../components/InlineDot/InlineDot";
import LazyBackendImage from "../../components/LazyBackendImage/LazyBackendImage";
import commonClasses from "./Commons.module.css";
import classes from "./SearchSchool.module.css";
import { useQuery } from "@tanstack/react-query";
import { API } from "../../types/api";
import { callAPI, formatPolishWordSuffix } from "../../modules/utils";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import CategoriesWidget from "../../components/CategoriesWidget/CategoriesWidget";
import { SortingType } from "../../modules/enums";
import {
	DEFAULT_SEARCH_PAGE_SIZE,
	SortingTypesMapping,
} from "../../modules/constants";
import { useLocation, useNavigate } from "react-router-dom";
import MessagePanel from "../../components/MessagePanel/MessagePanel";
import { useSnackbar } from "notistack";
import { AppContext } from "../../App";

export default function SearchSchool() {
	const [page, setPage] = useState<number>(1);
	const [sortOpt, setSortOpt] = useState<number>(1);
	const [query, setQuery] = useState<string>("");
	const [commitedQuery, setCommittedQuery] = useState<string>("");
	const [sortType, setSortType] = useState<SortingType>(SortingType.Asc);

	const queryDeferTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined
	);

	const { snackBarProps } = useContext(AppContext);
	const navigate = useNavigate();
	const location = useLocation();
	const snack = useSnackbar();

	const { data, isFetching, failureCount } = useQuery<
		API.School.Search.IResponse,
		API.School.Search.IEndpoint["error"]
	>({
		queryKey: [
			"Schools",
			`?q=${commitedQuery ? commitedQuery : ""}`,
			sortOpt,
			sortType,
		].concat([page.toString()]),
		queryFn: () =>
			callAPI<API.School.Search.IEndpoint>(
				"GET",
				"/api/v1/schools/search",
				{
					query: query != "" ? query : undefined,
					SortingTarget: sortOpt,
					SortingType: sortType,
					PageNumber: page,
					PagingSize: DEFAULT_SEARCH_PAGE_SIZE,
				}
			),
		retry: true,
		staleTime: 60000,
	});

	const updateQueryCallback = (newQuery: string) => {
		setQuery(newQuery);
		clearTimeout(queryDeferTimeout.current);

		queryDeferTimeout.current = setTimeout(() => {
			if (query !== newQuery) setCommittedQuery(newQuery);
		}, 700);
	};

	const sortingOptions = useMemo(() => {
		return [
			{ id: 0, label: "Nazwa" },
			{ id: 1, label: "Ocena" },
		];
	}, []);

	useEffect(() => {
		navigate(
			`?${
				commitedQuery ? `query=${commitedQuery}&` : ""
			}sortBy=${sortOpt}&order=${sortType}&page=${page}`,
			{
				replace: true,
			}
		);
	}, [page, sortOpt, commitedQuery, sortType]);

	useEffect(() => {
		const searchParams = new URLSearchParams(location.search);

		if (searchParams.has("page")) {
			const parsedPage = parseInt(searchParams.get("page")!);
			if (!Number.isNaN(parsedPage)) setPage(parsedPage);
		}

		if (searchParams.has("sortBy")) {
			const opt = parseInt(searchParams.get("sortBy")!);
			if (sortingOptions.some((elem) => elem.id == opt)) setSortOpt(opt);
		}

		if (searchParams.has("order")) {
			const opt = parseInt(searchParams.get("order")!);
			if (opt in SortingType) setSortType(opt);
		}

		if (searchParams.has("query")) {
			setCommittedQuery(searchParams.get(query)!);
		}
	}, []);

	useEffect(() => {
		if (failureCount == 1)
			snack.enqueueSnackbar({
				...snackBarProps,
				message: "Coś poszło nie tak",
				variant: "error",
			});
	}, [failureCount]);

	return (
		<div className={commonClasses.Wrapper}>
			<Typography variant="h4">Szkoły jazdy</Typography>
			<div className={commonClasses.Controls}>
				<TextField
					size="small"
					color="secondary"
					label="Wyszukaj"
					value={query}
					onChange={(ev) => updateQueryCallback(ev.target.value)}
				/>

				<div>
					<TextField
						select
						color="secondary"
						size="small"
						value={sortOpt}
						onChange={(e) => setSortOpt(parseInt(e.target.value))}
					>
						{sortingOptions.map((opt) => (
							<MenuItem key={opt.id} value={opt.id}>
								{opt.label}
							</MenuItem>
						))}
					</TextField>

					<TextField
						select
						color="secondary"
						size="small"
						value={sortType}
						onChange={(ev) =>
							setSortType(parseInt(ev.target.value))
						}
					>
						{SortingTypesMapping.map((opt) => (
							<MenuItem key={opt.id} value={opt.id}>
								{opt.name}
							</MenuItem>
						))}
					</TextField>
				</div>
			</div>

			{isFetching ? (
				<Fade in>
					<div>
						<MessagePanel
							className={commonClasses.FetchAnimHolder}
							image="/fetch-anim.svg"
							caption="Jeszcze chwila..."
						/>
					</div>
				</Fade>
			) : data?.entries.length ?? 0 > 0 ? (
				<>
					<div className={commonClasses.CardHolder}>
						{data?.entries.map((school) => (
							<Card
								className={commonClasses.Card}
								key={school.id}
								onClick={() => navigate(school.id.toString())}
								component={ButtonBase}
							>
								<LazyBackendImage
									className={commonClasses.CardImage}
									url={school.coverImage.url}
								/>
								<CardContent
									className={commonClasses.CardContent}
								>
									<Typography
										variant="overline"
										sx={{
											color: (theme) =>
												theme.palette.secondary.main,
										}}
									>
										4.75
										<InlineDot />
										{school.activeCoursesCount} aktywn
										{formatPolishWordSuffix(
											school.activeCoursesCount,
											["y kurs", "e kursy", "ych kursów"]
										)}
									</Typography>
									<Typography variant="h6">
										{school.name}
									</Typography>
									<Typography variant="body2" gutterBottom>
										{school.description}
									</Typography>
									<CategoriesWidget
										className={classes.CategoriesWidget}
										enabledList={
											new Set(school.courseOffers)
										}
										onlyActive
									/>
								</CardContent>
							</Card>
						))}
					</div>

					<Pagination
						className={commonClasses.Pagination}
						count={data?.pagesCount}
						page={page}
						onChange={(_ev, page) => setPage(page)}
					/>
				</>
			) : (
				<MessagePanel
					image="/no-results.svg"
					caption="Brak szkół spełniających kryteria"
				/>
			)}
		</div>
	);
}
