import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout.tsx'
import PortalLayout from './layouts/PortalLayout.tsx'
import AnonymousLayout from './layouts/AnonymousLayout.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ResendActivationPortal from './portals/ResendActivationPortal.tsx'
import ActivateAccountPortal from './portals/ActivateAccountPortal.tsx'


const LandingPage = React.lazy(()=>import("./pages/LandingPage.tsx"));
const RegisterSchoolPage = React.lazy(()=>import("./pages/RegisterSchoolPage.tsx"));

const LoginPortal = React.lazy(()=>import("./portals/LoginPortal.tsx"));
const RegisterPortal = React.lazy(()=>import("./portals/RegisterPortal/RegisterPortal.tsx"));
const LogoutPortal = React.lazy(()=>import("./portals/LogoutPortal.tsx"));

const DashboardPage = React.lazy(()=>import("./pages/Dashboard.tsx"));
const AdminPanelPage = React.lazy(()=>import("./pages/AdminPanel/AdminPanel.tsx"));

const qClient = new QueryClient();

const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement
);

root.render(
	<React.StrictMode>
		<BrowserRouter>
			<QueryClientProvider client={qClient}>
			<Routes>
				<Route path="*" element={<App useSplash={false} />}>
					<Route path="*" element={<AnonymousLayout />}>
						<Route path='' element={<LandingPage />}/>
						<Route path="apply" element={<RegisterSchoolPage />}/>
					</Route>
				</Route>
				<Route path="*" element={<App useSplash={true} />}>
					<Route path="*" element={<MainLayout />}>
						<Route path='home' element={<DashboardPage />} />
						<Route path='panel' element={<AdminPanelPage />} />
					</Route>

					<Route path='*' element={<PortalLayout />}>
						<Route path='login' element={<LoginPortal />} />
						<Route path='register' element={<RegisterPortal />} />
						<Route path="logout" element={<LogoutPortal />} />
						<Route path="resend-activation-link" element={<ResendActivationPortal />} />
						<Route path="activate-account" element={<ActivateAccountPortal />} />
					</Route>
				</Route>
			</Routes>
			</QueryClientProvider>
		</BrowserRouter>
	</React.StrictMode>
);
