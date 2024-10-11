import { CourseCategory, SortingType } from "./enums";

export const CourseCategoriesMapping: { id: CourseCategory; name: string }[] = [
	{ id: CourseCategory.AM, name: "AM" },
	{ id: CourseCategory.A, name: "A" },
	{ id: CourseCategory.A1, name: "A1" },
	{ id: CourseCategory.A2, name: "A2" },
	{ id: CourseCategory.B, name: "B" },
	{ id: CourseCategory.B1, name: "B1" },
	{ id: CourseCategory.C, name: "C" },
	{ id: CourseCategory.C1, name: "C1" },
	{ id: CourseCategory.D, name: "D" },
	{ id: CourseCategory.D1, name: "D1" },
	{ id: CourseCategory.T, name: "T" },
];

export const SortingTypesMapping: { id: SortingType; name: string }[] = [
	{ id: SortingType.Asc, name: "Rosnąco" },
	{ id: SortingType.Desc, name: "Malejąco" },
];

export const DEFAULT_SEARCH_PAGE_SIZE = 6;
