import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import GridViewOutlined from '@mui/icons-material/GridViewOutlined';
import MailOutline from '@mui/icons-material/MailOutline';
import WorkOutlineOutlined from '@mui/icons-material/WorkOutlineOutlined';
import ChatBubbleOutlineOutlined from '@mui/icons-material/ChatBubbleOutlineOutlined';
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined';
import PersonOutlineOutlined from '@mui/icons-material/PersonOutlineOutlined';
import BarChartOutlined from '@mui/icons-material/BarChartOutlined';
import AttachMoneyOutlined from '@mui/icons-material/AttachMoneyOutlined';
import SettingsOutlined from '@mui/icons-material/SettingsOutlined';
import HelpOutlineOutlined from '@mui/icons-material/HelpOutlineOutlined';
import BoltOutlined from '@mui/icons-material/BoltOutlined';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { userVar } from '../../../apollo/store';
import useTechnicianBadges from '../../hooks/useTechnicianBadges';

interface NavItem {
	id: string;
	icon: React.ReactNode;
	label: string;
	route: string;
	badge?: number;
}

const ICON_SIZE = 18;

const TechnicianSidebar: React.FC = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [isOnline] = useState(true);
	const badges = useTechnicianBadges();

	const displayName = user?.memberFullName || user?.memberNick || 'Technician';
	const initials = displayName
		.split(' ')
		.map((part) => part.charAt(0))
		.slice(0, 2)
		.join('')
		.toUpperCase();

	const navItems: NavItem[] = [
		{ id: 'dashboard', icon: <GridViewOutlined style={{ fontSize: ICON_SIZE }} />, label: 'Dashboard', route: '/technician/dashboard' },
		{ id: 'requests', icon: <MailOutline style={{ fontSize: ICON_SIZE }} />, label: 'Incoming Requests', route: '/technician/requests', badge: badges.requests },
		{ id: 'jobs', icon: <WorkOutlineOutlined style={{ fontSize: ICON_SIZE }} />, label: 'Active Jobs', route: '/technician/jobs', badge: badges.jobs },
		{ id: 'messages', icon: <ChatBubbleOutlineOutlined style={{ fontSize: ICON_SIZE }} />, label: 'Messages', route: '/technician/messages', badge: badges.messages },
		{ id: 'notifications', icon: <NotificationsNoneOutlined style={{ fontSize: ICON_SIZE + 1 }} />, label: 'Notifications', route: '/technician/notifications', badge: badges.notifications },
		{ id: 'profile', icon: <PersonOutlineOutlined style={{ fontSize: ICON_SIZE }} />, label: 'Public Profile', route: '/technician/profile' },
		{ id: 'analytics', icon: <BarChartOutlined style={{ fontSize: ICON_SIZE }} />, label: 'Analytics', route: '/technician/analytics' },
		{ id: 'earnings', icon: <AttachMoneyOutlined style={{ fontSize: ICON_SIZE + 1 }} />, label: 'Earnings', route: '/technician/earnings' },
	];

	const bottomItems: NavItem[] = [
		{ id: 'settings', icon: <SettingsOutlined style={{ fontSize: ICON_SIZE }} />, label: 'Settings', route: '/technician/settings' },
		{ id: 'help', icon: <HelpOutlineOutlined style={{ fontSize: ICON_SIZE }} />, label: 'Help & Support', route: '/cs' },
	];

	const isActive = (route: string) => router.pathname === route;

	const renderNavItem = (item: NavItem) => {
		const active = isActive(item.route);
		return (
			<button
				key={item.id}
				className={`fixora-technician-sidebar__nav-item ${active ? 'fixora-technician-sidebar__nav-item--active' : ''}`}
				onClick={() => router.push(item.route)}
				type="button"
			>
				<span className="fixora-technician-sidebar__nav-icon">{item.icon}</span>
				<span className="fixora-technician-sidebar__nav-label">{item.label}</span>
				{item.badge != null && item.badge > 0 && (
					<span className="fixora-technician-sidebar__nav-badge">{item.badge}</span>
				)}
			</button>
		);
	};

	return (
		<aside className="fixora-technician-sidebar">
			{/* Logo */}
			<div className="fixora-technician-sidebar__logo">
				<div className="fixora-logo-icon">
					<BoltOutlined style={{ fontSize: 19 }} />
				</div>
				<div>
					<div className="fixora-logo-text">FIXORA</div>
					<div className="fixora-logo-subtext">TECHNICIAN</div>
				</div>
			</div>

			{/* Status Badge */}
			<div className="fixora-technician-sidebar__status">
				<div className="fixora-technician-sidebar__status-dot" style={{ opacity: isOnline ? 1 : 0.5 }} />
				<span className="fixora-technician-sidebar__status-text">
					{isOnline ? 'Available for Jobs' : 'You are offline'}
				</span>
			</div>

			{/* Navigation */}
			<nav className="fixora-technician-sidebar__nav">
				<div className="fixora-technician-sidebar__section-label">MAIN MENU</div>
				{navItems.map(renderNavItem)}
			</nav>

			{/* Footer */}
			<div className="fixora-technician-sidebar__footer">
				<div className="fixora-technician-sidebar__bottom-nav">
					{bottomItems.map(renderNavItem)}
				</div>

				{/* Technician Card */}
				<button
					type="button"
					className="fixora-technician-sidebar__user-card"
					onClick={() => router.push('/technician/profile')}
				>
					<div className="fixora-technician-sidebar__user-avatar">{initials || 'T'}</div>
					<div className="fixora-technician-sidebar__user-info">
						<div className="fixora-technician-sidebar__user-name">{displayName}</div>
						<div className="fixora-technician-sidebar__user-role">Pro Technician</div>
					</div>
					<KeyboardArrowRight style={{ fontSize: 16, color: '#606060', flexShrink: 0 }} />
				</button>
			</div>
		</aside>
	);
};

export default TechnicianSidebar;
