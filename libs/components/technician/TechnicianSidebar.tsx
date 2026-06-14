import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { Stack, Avatar, Switch, Badge } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InboxIcon from '@mui/icons-material/Inbox';
import WorkIcon from '@mui/icons-material/Work';
import MessageIcon from '@mui/icons-material/Message';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import LogoutIcon from '@mui/icons-material/Logout';

interface NavItem {
	id: string;
	icon: React.ReactNode;
	label: string;
	route: string;
	badge?: number;
}

const TechnicianSidebar: React.FC = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [isOnline, setIsOnline] = useState(true);

	const navItems: NavItem[] = [
		{ id: 'dashboard', icon: <DashboardIcon sx={{ fontSize: 20 }} />, label: 'Dashboard', route: '/technician/dashboard' },
		{
			id: 'requests',
			icon: <InboxIcon sx={{ fontSize: 20 }} />,
			label: 'Incoming Requests',
			route: '/technician/requests',
		},
		{ id: 'jobs', icon: <WorkIcon sx={{ fontSize: 20 }} />, label: 'Active Jobs', route: '/technician/jobs' },
		{ id: 'messages', icon: <MessageIcon sx={{ fontSize: 20 }} />, label: 'Messages', route: '/technician/messages' },
		{ id: 'notifications', icon: <NotificationsIcon sx={{ fontSize: 20 }} />, label: 'Notifications', route: '/technician/notifications' },
		{ id: 'profile', icon: <PersonIcon sx={{ fontSize: 20 }} />, label: 'Public Profile', route: '/technician/profile' },
		{ id: 'analytics', icon: <BarChartIcon sx={{ fontSize: 20 }} />, label: 'Analytics', route: '/technician/analytics' },
		{ id: 'settings', icon: <SettingsIcon sx={{ fontSize: 20 }} />, label: 'Settings', route: '/technician/settings' },
	];

	const isActive = (route: string) => {
		return router.pathname === route;
	};

	const handleLogout = () => {
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
		router.push('/login');
	};

	return (
		<aside className="fixora-technician-sidebar">
			{/* Logo */}
			<div className="fixora-technician-sidebar__logo">
				<div className="fixora-logo-icon">
					<span>M</span>
				</div>
				<span className="fixora-logo-text">FIXORA</span>
			</div>

			{/* Navigation */}
			<nav className="fixora-technician-sidebar__nav">
				{navItems.map((item) => (
					<button
						key={item.id}
						className={`fixora-technician-sidebar__nav-item ${isActive(item.route) ? 'fixora-technician-sidebar__nav-item--active' : ''}`}
						onClick={() => router.push(item.route)}
						type="button"
					>
						<span className="fixora-technician-sidebar__nav-icon">{item.icon}</span>
						<span className="fixora-technician-sidebar__nav-label">{item.label}</span>
						{item.badge && <Badge badgeContent={item.badge} color="error" />}
					</button>
				))}
			</nav>

			{/* Footer - Online Toggle & Profile */}
			<div className="fixora-technician-sidebar__footer">
				<div className="fixora-technician-sidebar__online-status">
					<div className="fixora-technician-sidebar__status-info">
						<div className="fixora-technician-sidebar__status-dot" style={{ opacity: isOnline ? 1 : 0.5 }} />
						<span className="fixora-technician-sidebar__status-text">
							{isOnline ? 'You are online' : 'You are offline'}
						</span>
					</div>
					<Switch size="small" checked={isOnline} onChange={(e) => setIsOnline(e.target.checked)} />
				</div>

				<button className="fixora-technician-sidebar__logout" onClick={handleLogout} type="button">
					<LogoutIcon sx={{ fontSize: 18 }} />
					<span>Logout</span>
				</button>
			</div>
		</aside>
	);
};

export default TechnicianSidebar;
