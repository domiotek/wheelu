import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout.tsx'
import PortalLayout from './layouts/PortalLayout.tsx'
import AnonymousLayout from './layouts/AnonymousLayout.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Dashboard from './pages/Dashboard.tsx'


const LandingPage = React.lazy(()=>import("./pages/LandingPage.tsx"));
const RegisterSchoolPage = React.lazy(()=>import("./pages/RegisterSchoolPage.tsx"));

const LoginPortal = React.lazy(()=>import("./portals/LoginPortal.tsx"));
const RegisterPortal = React.lazy(()=>import("./portals/RegisterPortal.tsx"));
const LogoutPortal = React.lazy(()=>import("./portals/LogoutPortal.tsx"));

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
							<Route path='start' element={<LandingPage />}/>
							<Route path="register-school" element={<RegisterSchoolPage />}/>
						</Route>
					</Route>
					<Route path="*" element={<App useSplash={true} />}>
						<Route path="*" element={<MainLayout />}>
							<Route path='*' element={<Dashboard />} />
						</Route>

						<Route path="login" element={<PortalLayout />}>
							<Route index element={<LoginPortal />}/>
						</Route> 

						<Route path="register" element={<PortalLayout />}>
							<Route index element={<RegisterPortal />} />
						</Route>

						<Route path='logout' element={<PortalLayout />}>
							<Route index element={<LogoutPortal />} />
						</Route>
					</Route>
			</Routes>
			</QueryClientProvider>
		</BrowserRouter>
	</React.StrictMode>
);
