import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.tsx";
import PortalLayout from "./layouts/PortalLayout.tsx";
import AnonymousLayout from "./layouts/AnonymousLayout.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Settings } from "luxon";

Settings.defaultLocale = "pl-PL";

/** Portals */

const LoginPortal = React.lazy(() => import("./portals/LoginPortal.tsx"));
const RegisterPortal = React.lazy(
	() => import("./portals/RegisterPortal/RegisterPortal.tsx")
);
const LogoutPortal = React.lazy(() => import("./portals/LogoutPortal.tsx"));
const ResendActivationPortal = React.lazy(
	() => import("./portals/ResendActivationPortal.tsx")
);
const ActivateAccountPortal = React.lazy(
	() => import("./portals/ActivateAccountPortal.tsx")
);
const ResetPasswordPortal = React.lazy(
	() => import("./portals/ResetPasswordPortal.tsx")
);
const RegisterInstructorPortal = React.lazy(
	() => import("./portals/RegisterPortal/RegisterInstructorPortal.tsx")
);
const JoinSchoolPortal = React.lazy(
	() => import("./portals/JoinSchoolPortal.tsx")
);
const PaymentSuccessPortal = React.lazy(
	() => import("./portals/PaymentSuccessPortal.tsx")
);
const PaymentFailurePortal = React.lazy(
	() => import("./portals/PaymentFailurePortal.tsx")
);
const ExamPortal = React.lazy(() => import("./portals/ExamPortalWrapper.tsx"));

/** Pages */

const LandingPage = React.lazy(() => import("./pages/LandingPage.tsx"));
const RegisterSchoolPage = React.lazy(
	() => import("./pages/RegisterSchoolPage.tsx")
);
const DashboardPage = React.lazy(() => import("./pages/Dashboard.tsx"));
const AdminPanelPage = React.lazy(
	() => import("./pages/AdminPanel/AdminPanel.tsx")
);
const ManageSchoolPage = React.lazy(
	() => import("./pages/ManageSchool/ManageSchoolPage.tsx")
);
const SchoolPageWrapper = React.lazy(
	() => import("./pages/ManageSchool/SchoolPageWrapper.tsx")
);
const PublicSchoolPage = React.lazy(
	() => import("./pages/School/SchoolPage.tsx")
);
const SearchCoursePage = React.lazy(
	() => import("./pages/Search/SearchCourse.tsx")
);
const SearchSchoolPage = React.lazy(
	() => import("./pages/Search/SearchSchool.tsx")
);
const ProfilePage = React.lazy(() => import("./pages/Profile/ProfilePage.tsx"));
const CoursePage = React.lazy(() => import("./pages/Course/CoursePage.tsx"));

/** Admin panel subviews */

const MainAPView = React.lazy(
	() => import("./pages/AdminPanel/views/Main.tsx")
);
const AllApplicationsView = React.lazy(
	() => import("./pages/AdminPanel/views/AllApplications.tsx")
);
const AllSchoolsView = React.lazy(
	() => import("./pages/AdminPanel/views/AllSchools.tsx")
);
const AllUsersView = React.lazy(
	() => import("./pages/AdminPanel/views/AllUsers.tsx")
);
const ResolveApplicationView = React.lazy(
	() => import("./pages/AdminPanel/views/ResolveApplication.tsx")
);

/**
 * ManageSchoolPage subviews
 */
const SchoolManagementMainView = React.lazy(
	() => import("./pages/ManageSchool/views/Main.tsx")
);
const SchoolManagementManageView = React.lazy(
	() => import("./pages/ManageSchool/views/ManageView/Manage.tsx")
);
const SchoolManagementOfferView = React.lazy(
	() => import("./pages/ManageSchool/views/OfferView/Offer.tsx")
);
const SchoolManagementInstructorsView = React.lazy(
	() => import("./pages/ManageSchool/views/InstructorsView/Instructors.tsx")
);
const SchoolManagementInstructorView = React.lazy(
	() => import("./pages/ManageSchool/views/InstructorView/Instructor.tsx")
);
const SchoolManagementInstructorCoursesView = React.lazy(
	() => import("./pages/ManageSchool/views/InstructorCoursesView/Courses.tsx")
);
const SchoolManagementInviteInstructorView = React.lazy(
	() =>
		import(
			"./pages/ManageSchool/views/InviteInstructorView/InviteInstructorView.tsx"
		)
);
const SchoolManagementVehiclesView = React.lazy(
	() => import("./pages/ManageSchool/views/VehiclesView/Vehicles.tsx")
);
const SchoolManagementCoursesView = React.lazy(
	() => import("./pages/ManageSchool/views/CoursesView/Courses.tsx")
);
const SchoolManagementTransactionsView = React.lazy(
	() => import("./pages/ManageSchool/views/TransactionsView/Transactions.tsx")
);
const SchoolManagementRequestsView = React.lazy(
	() => import("./pages/ManageSchool/views/RequestsView/RequestsView.tsx")
);

/** Public School sub-views */

const PublicSchoolCoursesView = React.lazy(
	() => import("./pages/School/views/CoursesView/CoursesView.tsx")
);
const PublicSchoolCourseView = React.lazy(
	() => import("./pages/School/views/CourseView/CourseView.tsx")
);
const PublicSchoolInstructorsView = React.lazy(
	() => import("./pages/School/views/InstructorsView/InstructorsView.tsx")
);
const PublicSchoolVehiclesView = React.lazy(
	() => import("./pages/School/views/VehiclesView/VehiclesView.tsx")
);
const PublicSchoolContactView = React.lazy(
	() => import("./pages/School/views/ContactView/ContactView.tsx")
);

/** Course sub-views */
const CourseRidesView = React.lazy(
	() => import("./pages/Course/views/RidesView/RidesView.tsx")
);
const CourseExamsView = React.lazy(
	() => import("./pages/Course/views/ExamsView/ExamsView.tsx")
);
const CourseManageView = React.lazy(
	() => import("./pages/Course/views/ManageView/ManageView.tsx")
);

const qClient = new QueryClient();

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement
);

const schoolManagementViews = (
	<>
		<Route path="*" element={<SchoolManagementMainView />} />
		<Route path="manage" element={<SchoolManagementManageView />} />
		<Route path="offer" element={<SchoolManagementOfferView />} />
		<Route
			path="instructors"
			element={<SchoolManagementInstructorsView />}
		/>
		<Route
			path="instructors/invite"
			element={<SchoolManagementInviteInstructorView />}
		/>
		<Route
			path="instructors/:instructorId"
			element={<SchoolManagementInstructorView />}
		/>
		<Route
			path="instructors/:instructorId/courses"
			element={<SchoolManagementInstructorCoursesView />}
		/>
		<Route path="vehicles" element={<SchoolManagementVehiclesView />} />
		<Route path="courses" element={<SchoolManagementCoursesView />} />
		<Route
			path="transactions"
			element={<SchoolManagementTransactionsView />}
		/>
		<Route path="requests" element={<SchoolManagementRequestsView />} />
	</>
);

root.render(
	<React.StrictMode>
		<BrowserRouter>
			<QueryClientProvider client={qClient}>
				<Routes>
					<Route path="*" element={<App useSplash={false} />}>
						<Route path="*" element={<AnonymousLayout />}>
							<Route path="" element={<LandingPage />} />
							<Route
								path="apply"
								element={<RegisterSchoolPage />}
							/>
						</Route>
					</Route>
					<Route path="*" element={<App useSplash={true} />}>
						<Route path="*" element={<MainLayout />}>
							<Route path="home" element={<DashboardPage />} />
							<Route path="panel" element={<AdminPanelPage />}>
								<Route index element={<MainAPView />} />
								<Route
									path="applications"
									element={<AllApplicationsView />}
								/>
								<Route
									path="applications/:id"
									element={<ResolveApplicationView />}
								/>
								<Route
									path="schools"
									element={<AllSchoolsView />}
								/>
								<Route
									path="schools/:id"
									element={
										<ManageSchoolPage viewPoint="admin" />
									}
								>
									{schoolManagementViews}
								</Route>
								<Route
									path="users"
									element={<AllUsersView />}
								/>
							</Route>
							<Route
								path="courses"
								element={<SearchCoursePage />}
							/>
							<Route
								path="schools"
								element={<SearchSchoolPage />}
							/>
							<Route path="schools/:id">
								<Route path="*" element={<PublicSchoolPage />}>
									<Route
										path="*"
										element={<PublicSchoolCoursesView />}
									/>
									<Route
										path="courses/:courseId"
										element={<PublicSchoolCourseView />}
									/>
									<Route
										path="instructors"
										element={
											<PublicSchoolInstructorsView />
										}
									/>
									<Route
										path="vehicles"
										element={<PublicSchoolVehiclesView />}
									/>
									<Route
										path="contact"
										element={<PublicSchoolContactView />}
									/>
								</Route>
								<Route
									path="manage"
									element={<SchoolPageWrapper />}
								>
									{schoolManagementViews}
								</Route>
							</Route>
							<Route path="profile" element={<ProfilePage />} />
							<Route
								path="courses/:courseID"
								element={<CoursePage />}
							>
								<Route path="*" element={<CourseRidesView />} />
								<Route
									path="exams"
									element={<CourseExamsView />}
								/>
								<Route
									path="manage"
									element={<CourseManageView />}
								/>
							</Route>
						</Route>

						<Route path="*" element={<PortalLayout />}>
							<Route path="login" element={<LoginPortal />} />
							<Route
								path="register"
								element={<RegisterPortal />}
							/>
							<Route path="logout" element={<LogoutPortal />} />
							<Route
								path="resend-activation-link"
								element={<ResendActivationPortal />}
							/>
							<Route
								path="activate-account"
								element={<ActivateAccountPortal />}
							/>
							<Route
								path="reset-password"
								element={<ResetPasswordPortal />}
							/>
							<Route
								path="create-instructor"
								element={<RegisterInstructorPortal />}
							/>
							<Route path="join" element={<JoinSchoolPortal />} />
							<Route
								path="payment-success"
								element={<PaymentSuccessPortal />}
							/>
							<Route
								path="payment-failure"
								element={<PaymentFailurePortal />}
							/>
							<Route
								path="exam/:examID"
								element={<ExamPortal />}
							/>
						</Route>
					</Route>
				</Routes>
			</QueryClientProvider>
		</BrowserRouter>
	</React.StrictMode>
);
