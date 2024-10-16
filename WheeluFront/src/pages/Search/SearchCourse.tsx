import {
	ButtonBase,
	Card,
	CardContent,
	Chip,
	Fade,
	MenuItem,
	Pagination,
	TextField,
	Typography,
} from "@mui/material";
import LazyBackendImage from "../../components/LazyBackendImage/LazyBackendImage";
import commonClasses from "./Commons.module.css";
import classes from "./SearchCourse.module.css";
import { useEffect, useMemo, useState } from "react";
import { CourseCategory, SortingType } from "../../modules/enums";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { API } from "../../types/api";
import { callAPI, formatPolishWordSuffix } from "../../modules/utils";
import {
	CourseCategoriesMapping,
	DEFAULT_SEARCH_PAGE_SIZE,
	SortingTypesMapping,
} from "../../modules/constants";
import { CurrencyFormatter } from "../../modules/formatters";
import MessagePanel from "../../components/MessagePanel/MessagePanel";
import { toast } from "react-toastify";

export default function SearchCourse() {
	const [page, setPage] = useState<number>(1);
	const [sortOpt, setSortOpt] = useState<number>(1);
	const [category, setCategory] = useState<CourseCategory | -1>(-1);
	const [sortType, setSortType] = useState<SortingType>(SortingType.Asc);

	const navigate = useNavigate();
	const location = useLocation();

	const { data, isFetching, failureCount } = useQuery<
		API.Offers.Courses.Search.IResponse,
		API.Offers.Courses.Search.IEndpoint["error"]
	>({
		queryKey: [
			"Courses",
			`?q=${category ? category : ""}`,
			sortOpt,
			sortType,
		].concat([page.toString()]),
		queryFn: () =>
			callAPI<API.Offers.Courses.Search.IEndpoint>(
				"GET",
				"/api/v1/offers/search",
				{
					CategoryType: category != -1 ? category : undefined,
					SortingTarget: sortOpt,
					SortingType: sortType,
					PageNumber: page,
					PagingSize: DEFAULT_SEARCH_PAGE_SIZE,
				}
			),
		retry: true,
		staleTime: 60000,
	});

	const sortingOptions = useMemo(() => {
		return [
			{ id: 0, label: "Cena" },
			{ id: 1, label: "Ocena" },
		];
	}, []);

	useEffect(() => {
		navigate(
			`?category=${category}&sortBy=${sortOpt}&order=${sortType}&page=${page}`,
			{
				replace: true,
			}
		);
	}, [page, sortOpt, category, sortType]);

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

		if (searchParams.has("category")) {
			const opt = parseInt(searchParams.get("category")!);
			if (opt in CourseCategory) setCategory(opt);
		}
	}, []);

	useEffect(() => {
		if (failureCount == 1) toast.error("Coś poszło nie tak");
	}, [failureCount]);

	return (
		<div className={commonClasses.Wrapper}>
			<Typography variant="h4">Oferta kursów</Typography>
			<div className={commonClasses.Controls}>
				<TextField
					select
					color="secondary"
					size="small"
					value={category}
					onChange={(e) => setCategory(parseInt(e.target.value))}
					disabled={isFetching}
				>
					<MenuItem value="-1">Dowolna</MenuItem>
					{CourseCategoriesMapping.map((opt) => (
						<MenuItem key={opt.id} value={opt.id}>
							{opt.name}
						</MenuItem>
					))}
				</TextField>

				<div>
					<TextField
						select
						color="secondary"
						size="small"
						value={sortOpt}
						onChange={(e) => setSortOpt(parseInt(e.target.value))}
						disabled={isFetching}
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
						disabled={isFetching}
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
							caption="Szukamy ofert..."
						/>
					</div>
				</Fade>
			) : data?.entries.length ?? 0 > 0 ? (
				<>
					<div className={commonClasses.CardHolder}>
						{data?.entries.map((course) => (
							<Card
								className={commonClasses.Card}
								key={course.id}
								onClick={() =>
									navigate(
										`/schools/${course.school.id}/courses/${course.id}`
									)
								}
								component={ButtonBase}
							>
								<LazyBackendImage
									className={commonClasses.CardImage}
									url={course.school.coverImage.url}
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
										Kategoria {course.category.name}
									</Typography>
									<Typography variant="h6">
										{course.school.name}
									</Typography>
									<Typography variant="body2" gutterBottom>
										{course.school.description}
									</Typography>
									<div className={classes.Footer}>
										<Chip
											label={`${
												course.hoursCount
											} godzin${formatPolishWordSuffix(
												course.hoursCount,
												["a", "y", ""]
											)}`}
											size="small"
										/>
										<Typography variant="h6">
											{CurrencyFormatter.format(
												course.price
											)}
										</Typography>
									</div>
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
					caption="Brak ofert spełniających kryteria"
				/>
			)}
		</div>
	);
}
