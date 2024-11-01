import ViewWrapper from "../Wrapper";
import CourseTable from "./components/InstructorCourseTable";
import { useParams } from "react-router-dom";
import React, { useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { callAPI, OutsideContextNotifier } from "../../../../modules/utils";
import { API } from "../../../../types/api";
import { SchoolPageContext } from "../../ManageSchoolPage";
import LoadingScreen from "../../../../components/LoadingScreen/LoadingScreen";
import AuthService from "../../../../services/Auth";

interface IContext {
	queryKey: (string | number)[];
	invalidateQuery: () => void;
}

export const CourseOffersContext = React.createContext<IContext>({
	invalidateQuery: OutsideContextNotifier,
	queryKey: [],
});

export default function CoursesSchoolView() {
	const params = useParams();

	const { schoolData } = useContext(SchoolPageContext);

	const queryKey = useMemo(
		() => [
			"Schools",
			"#",
			schoolData?.id,
			"Instructors",
			"#",
			parseInt(params["instructorId"] ?? ""),
		],
		[schoolData, params]
	);

	const queryParams = useMemo(
		() => ({
			schoolID: schoolData!.id,
			instructorID: parseInt(params["instructorId"] ?? ""),
		}),
		[schoolData, params]
	);

	const { data } = useQuery<
		API.Instructors.Get.IResponse,
		API.Instructors.Get.IEndpoint["error"]
	>({
		queryKey,
		queryFn: () =>
			callAPI<API.Instructors.Get.IEndpoint>(
				"GET",
				"/api/v1/schools/:schoolID/instructors/:instructorID",
				null,
				queryParams
			),
		retry: true,
		staleTime: 60000,
	});

	if (!data)
		return (
			<ViewWrapper headline="Kursy instruktora">
				<LoadingScreen />
			</ViewWrapper>
		);

	return (
		<ViewWrapper
			headline={
				<>
					Kursy prowadzone przez{" "}
					{AuthService.getUserFullName(data.instructor.user)}
				</>
			}
		>
			<CourseTable courses={data.assignedCourses} />
		</ViewWrapper>
	);
}
