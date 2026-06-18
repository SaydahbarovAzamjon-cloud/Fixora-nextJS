import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useReactiveVar } from '@apollo/client';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import AddOutlined from '@mui/icons-material/AddOutlined';
import ChatBubbleOutlineOutlined from '@mui/icons-material/ChatBubbleOutlineOutlined';
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined';
import SettingsOutlined from '@mui/icons-material/SettingsOutlined';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { userVar, profileImageDraftVar } from '../../../apollo/store';
import useTechnicianBadges from '../../hooks/useTechnicianBadges';
import { resolveProfileImageUrl } from '../../utils/profileImage';

interface HeaderProps {
	activePage: string;
}

const PAGE_TITLE_KEYS: Record<string, string> = {
	dashboard: 'nav.dashboard',
	requests: 'nav.requests',
	jobs: 'nav.jobs',
	messages: 'nav.messages',
	notifications: 'nav.notifications',
	profile: 'nav.profile',
	analytics: 'nav.analytics',
	earnings: 'nav.earnings',
	write: 'nav.writeArticle',
	articles: 'nav.myArticles',
	settings: 'nav.settings',
	help: 'nav.help',
};

const Header: React.FC<HeaderProps> = ({ activePage }) => {
	const { t } = useTranslation('technician');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const profileDraft = useReactiveVar(profileImageDraftVar);
	const badges = useTechnicianBadges();
	const [searchFocused, setSearchFocused] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [dropdownOpen, setDropdownOpen] = useState(false);

	const displayName = user?.memberFullName || user?.memberNick || t('nav.fallbackName');
	const initials = displayName
		.split(' ')
		.map((part) => part.charAt(0))
		.slice(0, 2)
		.join('')
		.toUpperCase();

	const pageTitleKey = PAGE_TITLE_KEYS[activePage] ?? 'nav.dashboard';
	const avatarSrc = profileDraft ?? user?.memberImage;

	const handleLogout = () => {
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
		router.push('/login');
	};

	const submitSearch = () => {
		const term = searchTerm.trim();
		if (!term) return;
		router.push(`/technician/jobs?search=${encodeURIComponent(term)}`);
	};

	const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			submitSearch();
		}
	};

	return (
		<header className="fixora-tech-header">
			<div className="fixora-tech-header__title">
				<h1>{t(pageTitleKey)}</h1>
			</div>

			<div
				className={`fixora-tech-header__search ${searchFocused ? 'fixora-tech-header__search--focused' : ''}`}
				onClick={() => !searchFocused && (document.querySelector('.fixora-tech-header__search-input') as HTMLInputElement)?.focus()}
			>
				<SearchOutlined className="fixora-tech-header__search-icon" style={{ fontSize: 17 }} />
				<input
					className="fixora-tech-header__search-input"
					placeholder={t('header.searchPlaceholder')}
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					onKeyDown={handleSearchKeyDown}
					onFocus={() => setSearchFocused(true)}
					onBlur={() => setSearchFocused(false)}
				/>
				<kbd className="fixora-tech-header__search-kbd">⌘K</kbd>
			</div>

			<div className="fixora-tech-header__spacer" />

			<button
				className="fixora-tech-header__new-quote"
				onClick={() => router.push('/technician/write')}
			>
				<AddOutlined style={{ fontSize: 16 }} /> {t('header.newQuote')}
			</button>

			<button
				className="fixora-tech-header__icon-btn"
				title={t('nav.messages')}
				onClick={() => router.push('/technician/messages')}
			>
				<ChatBubbleOutlineOutlined style={{ fontSize: 18 }} />
				{badges.messages > 0 && <span className="fixora-tech-header__badge">{badges.messages}</span>}
			</button>

			<button
				className="fixora-tech-header__icon-btn"
				title={t('nav.notifications')}
				onClick={() => router.push('/technician/notifications')}
			>
				<NotificationsNoneOutlined style={{ fontSize: 19 }} />
				{badges.notifications > 0 && <span className="fixora-tech-header__badge">{badges.notifications}</span>}
			</button>

			<button
				className="fixora-tech-header__icon-btn"
				title={t('nav.settings')}
				onClick={() => router.push('/technician/settings')}
			>
				<SettingsOutlined style={{ fontSize: 18 }} />
			</button>

			<div className="fixora-tech-header__profile">
				<button
					className="fixora-tech-header__profile-btn"
					onClick={() => setDropdownOpen(!dropdownOpen)}
				>
					<div className="fixora-tech-header__avatar">
						{avatarSrc
							? <img src={resolveProfileImageUrl(avatarSrc)} alt={displayName} />
							: initials || 'T'}
					</div>
					<div className="fixora-tech-header__profile-info">
						<div className="fixora-tech-header__profile-name">{displayName}</div>
						<div className="fixora-tech-header__profile-role">{t('nav.proTechnician')}</div>
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
							{t('header.viewProfile')}
						</button>
						<button
							className="fixora-tech-header__dropdown-item"
							onClick={() => {
								router.push('/technician/settings');
								setDropdownOpen(false);
							}}
						>
							{t('nav.settings')}
						</button>
						<div className="fixora-tech-header__dropdown-divider" />
						<button
							className="fixora-tech-header__dropdown-item fixora-tech-header__dropdown-item--danger"
							onClick={handleLogout}
						>
							{t('header.signOut')}
						</button>
					</div>
				)}
			</div>
		</header>
	);
};

export default Header;
