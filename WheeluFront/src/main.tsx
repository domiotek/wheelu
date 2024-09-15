import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.tsx";
import PortalLayout from "./layouts/PortalLayout.tsx";
import AnonymousLayout from "./layouts/AnonymousLayout.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ResendActivationPortal from "./portals/ResendActivationPortal.tsx";
import ActivateAccountPortal from "./portals/ActivateAccountPortal.tsx";
import ResolveApplication from "./pages/AdminPanel/views/ResolveApplication.tsx";
import ResetPasswordPortal from "./portals/ResetPasswordPortal.tsx";

const LandingPage = React.lazy(() => import("./pages/LandingPage.tsx"));
const RegisterSchoolPage = React.lazy(
	() => import("./pages/RegisterSchoolPage.tsx")
);

const LoginPortal = React.lazy(() => import("./portals/LoginPortal.tsx"));
const RegisterPortal = React.lazy(
	() => import("./portals/RegisterPortal/RegisterPortal.tsx")
);
const LogoutPortal = React.lazy(() => import("./portals/LogoutPortal.tsx"));

const DashboardPage = React.lazy(() => import("./pages/Dashboard.tsx"));

const AdminPanelPage = React.lazy(
	() => import("./pages/AdminPanel/AdminPanel.tsx")
);
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

const ManageSchoolPage = React.lazy(
	() => import("./pages/ManageSchool/ManageSchoolPage.tsx")
);
const SchoolPageWrapper = React.lazy(
	() => import("./pages/ManageSchool/SchoolPageWrapper.tsx")
);
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
	() => import("./pages/ManageSchool/views/InstructorView/Instructors.tsx")
);

const SchoolManagementInviteInstructorView = React.lazy(
	() =>
		import(
			"./pages/ManageSchool/views/InviteInstructorView/InviteInstructorView.tsx"
		)
);

const PublicSchoolPage = React.lazy(
	() => import("./pages/School/SchoolPage.tsx")
);

const PublicSchoolCoursesView = React.lazy(
	() => import("./pages/School/views/CoursesView/CoursesView.tsx")
);

const PublicSchoolCourseView = React.lazy(
	() => import("./pages/School/views/CourseView/CourseView.tsx")
);

const PublicSchoolInstructorsView = React.lazy(
	() => import("./pages/School/views/InstructorsView/InstructorsView.tsx")
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
									element={<ResolveApplication />}
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
								</Route>
								<Route
									path="manage"
									element={<SchoolPageWrapper />}
								>
									{schoolManagementViews}
								</Route>
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
						</Route>
					</Route>
				</Routes>
			</QueryClientProvider>
		</BrowserRouter>
	</React.StrictMode>
);
