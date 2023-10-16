import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'

import './App.css';

import '../../assets/bootstrap.css';
import Main from './pages/Main';
import Accounts from './pages/Accounts';
import Games from './pages/Games';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import { Nav } from 'react-bootstrap';
import CustomNavLink from './components/CustomNavLink';
import { Toaster } from 'react-hot-toast';
import { useSteamUpdater } from './context/SteamUpdaterContext';
import UpdateStatus from './components/modals/UpdateStatus';
import ErrorNotification from './components/ErrorNotification';
import UpdatePending from './components/modals/UpdatePending';

export default function App() {
	const steamUpdater = useSteamUpdater();
	const location = useLocation();

	useEffect(() => {
		console.log("steamUpdater.init()");
		steamUpdater.init();
	}, []);

	return (
		<div>
			<Nav fill variant="tabs" defaultActiveKey={location.pathname}>
				<CustomNavLink path='/'>Steam Updater</CustomNavLink>
				<CustomNavLink path='/accounts'>Accounts</CustomNavLink>
				<CustomNavLink path='/games'>Games</CustomNavLink>
				<CustomNavLink path='/settings'>Settings</CustomNavLink>
			</Nav>

			<ErrorNotification />

			<div>
				<Routes>
					{/* All our routes */}
					<Route path="/" element={<Main />} />
					<Route path="/accounts" element={<Accounts />} />
					<Route path="/games" element={<Games />} />
					<Route path="/settings" element={<Settings />} />

					{/* Error page */}
					<Route path="*" element={<NotFound />} />
				</Routes>
			</div>

			<UpdateStatus />
			<UpdatePending />
			<Toaster />
		</div>
	);
}
