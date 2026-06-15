import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import AddOutlined from '@mui/icons-material/AddOutlined';
import ChatBubbleOutlineOutlined from '@mui/icons-material/ChatBubbleOutlineOutlined';
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined';
import SettingsOutlined from '@mui/icons-material/SettingsOutlined';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { userVar } from '../../../apollo/store';
import useTechnicianBadges from '../../hooks/useTechnicianBadges';

interface HeaderProps {
	activePage: string;
}

const PAGE_TITLES: Record<string, string> = {
	dashboard: 'Dashboard',
	requests: 'Incoming Requests',
	jobs: 'Active Jobs',
	messages: 'Messages',
	notifications: 'Notifications',
	profile: 'Public Profile',
	analytics: 'Analytics',
	earnings: 'Earnings',
	settings: 'Settings',
	help: 'Help & Support',
};

const Header: React.FC<HeaderProps> = ({ activePage }) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const badges = useTechnicianBadges();
	const [searchFocused, setSearchFocused] = useState(false);
	const [dropdownOpen, setDropdownOpen] = useState(false);

	const displayName = user?.memberFullName || user?.memberNick || 'Technician';
	const initials = displayName
		.split(' ')
		.map((part) => part.charAt(0))
		.slice(0, 2)
		.join('')
		.toUpperCase();

	const handleLogout = () => {
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
		router.push('/login');
	};

	return (
		<header className="fixora-tech-header">
			{/* Page title */}
			<div className="fixora-tech-header__title">
				<h1>{PAGE_TITLES[activePage] || 'Dashboard'}</h1>
			</div>

			{/* Search */}
			<div
				className={`fixora-tech-header__search ${searchFocused ? 'fixora-tech-header__search--focused' : ''}`}
				onClick={() => !searchFocused && (document.querySelector('.fixora-tech-header__search-input') as HTMLInputElement)?.focus()}
			>
				<SearchOutlined className="fixora-tech-header__search-icon" style={{ fontSize: 17 }} />
				<input
					className="fixora-tech-header__search-input"
					placeholder="Search jobs, clients, devices..."
					onFocus={() => setSearchFocused(true)}
					onBlur={() => setSearchFocused(false)}
				/>
				<kbd className="fixora-tech-header__search-kbd">⌘K</kbd>
			</div>

			<div className="fixora-tech-header__spacer" />

			{/* New Quote button */}
			<button className="fixora-tech-header__new-quote">
				<AddOutlined style={{ fontSize: 16 }} /> New Quote
			</button>

			{/* Icon buttons */}
			<button
				className="fixora-tech-header__icon-btn"
				title="Messages"
				onClick={() => router.push('/technician/messages')}
			>
				<ChatBubbleOutlineOutlined style={{ fontSize: 18 }} />
				{badges.messages > 0 && <span className="fixora-tech-header__badge">{badges.messages}</span>}
			</button>

			<button
				className="fixora-tech-header__icon-btn"
				title="Notifications"
				onClick={() => router.push('/technician/notifications')}
			>
				<NotificationsNoneOutlined style={{ fontSize: 19 }} />
				{badges.notifications > 0 && <span className="fixora-tech-header__badge">{badges.notifications}</span>}
			</button>

			<button
				className="fixora-tech-header__icon-btn"
				title="Settings"
				onClick={() => router.push('/technician/settings')}
			>
				<SettingsOutlined style={{ fontSize: 18 }} />
			</button>

			{/* Profile dropdown */}
			<div className="fixora-tech-header__profile">
				<button
					className="fixora-tech-header__profile-btn"
					onClick={() => setDropdownOpen(!dropdownOpen)}
				>
					<div className="fixora-tech-header__avatar">{initials || 'T'}</div>
					<div className="fixora-tech-header__profile-info">
						<div className="fixora-tech-header__profile-name">{displayName}</div>
						<div className="fixora-tech-header__profile-role">Pro Technician</div>
					</div>
					<KeyboardArrowDown style={{ fontSize: 16, color: '#606060' }} />
				</button>

				{dropdownOpen && (
					<div className="fixora-tech-header__dropdown">
						<button
							className="fixora-tech-header__dropdown-item"
							onClick={() => {
								router.push('/technician/profile');
								setDropdownOpen(false);
							}}
						>
							View Profile
						</button>
						<button
							className="fixora-tech-header__dropdown-item"
							onClick={() => {
								router.push('/technician/settings');
								setDropdownOpen(false);
							}}
						>
							Settings
						</button>
						<div className="fixora-tech-header__dropdown-divider" />
						<button
							className="fixora-tech-header__dropdown-item fixora-tech-header__dropdown-item--danger"
							onClick={handleLogout}
						>
							Sign Out
						</button>
					</div>
				)}
			</div>
		</header>
	);
};

export default Header;
