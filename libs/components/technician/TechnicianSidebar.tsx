import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useReactiveVar } from '@apollo/client';
import { resolveProfileImageUrl } from '../../utils/profileImage';
import GridViewOutlined from '@mui/icons-material/GridViewOutlined';
import MailOutline from '@mui/icons-material/MailOutline';
import WorkOutlineOutlined from '@mui/icons-material/WorkOutlineOutlined';
import ChatBubbleOutlineOutlined from '@mui/icons-material/ChatBubbleOutlineOutlined';
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined';
import PersonOutlineOutlined from '@mui/icons-material/PersonOutlineOutlined';
import BarChartOutlined from '@mui/icons-material/BarChartOutlined';
import AttachMoneyOutlined from '@mui/icons-material/AttachMoneyOutlined';
import MenuBookOutlined from '@mui/icons-material/MenuBookOutlined';
import ArticleOutlined from '@mui/icons-material/ArticleOutlined';
import SettingsOutlined from '@mui/icons-material/SettingsOutlined';
import HelpOutlineOutlined from '@mui/icons-material/HelpOutlineOutlined';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { userVar } from '../../../apollo/store';
import useTechnicianBadges from '../../hooks/useTechnicianBadges';
import { FixoraLogo } from '../brand';

interface NavItem {
	id: string;
	icon: React.ReactNode;
	labelKey: string;
	route: string;
	badge?: number;
}

const ICON_SIZE = 18;

const TechnicianSidebar: React.FC = () => {
	const { t } = useTranslation('technician');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [isOnline] = useState(true);
	const badges = useTechnicianBadges();

	const displayName = user?.memberFullName || user?.memberNick || t('nav.fallbackName');
	const initials = displayName
		.split(' ')
		.map((part) => part.charAt(0))
		.slice(0, 2)
		.join('')
		.toUpperCase();

	const navItems: NavItem[] = [
		{ id: 'dashboard', icon: <GridViewOutlined style={{ fontSize: ICON_SIZE }} />, labelKey: 'nav.dashboard', route: '/technician/dashboard' },
		{ id: 'requests', icon: <MailOutline style={{ fontSize: ICON_SIZE }} />, labelKey: 'nav.requests', route: '/technician/requests', badge: badges.requests },
		{ id: 'jobs', icon: <WorkOutlineOutlined style={{ fontSize: ICON_SIZE }} />, labelKey: 'nav.jobs', route: '/technician/jobs', badge: badges.jobs },
		{ id: 'messages', icon: <ChatBubbleOutlineOutlined style={{ fontSize: ICON_SIZE }} />, labelKey: 'nav.messages', route: '/technician/messages', badge: badges.messages },
		{ id: 'notifications', icon: <NotificationsNoneOutlined style={{ fontSize: ICON_SIZE + 1 }} />, labelKey: 'nav.notifications', route: '/technician/notifications', badge: badges.notifications },
		{ id: 'profile', icon: <PersonOutlineOutlined style={{ fontSize: ICON_SIZE }} />, labelKey: 'nav.profile', route: '/technician/profile' },
		{ id: 'analytics', icon: <BarChartOutlined style={{ fontSize: ICON_SIZE }} />, labelKey: 'nav.analytics', route: '/technician/analytics' },
		{ id: 'earnings', icon: <AttachMoneyOutlined style={{ fontSize: ICON_SIZE + 1 }} />, labelKey: 'nav.earnings', route: '/technician/earnings' },
		{ id: 'write', icon: <MenuBookOutlined style={{ fontSize: ICON_SIZE }} />, labelKey: 'nav.writeArticle', route: '/technician/write' },
		{ id: 'articles', icon: <ArticleOutlined style={{ fontSize: ICON_SIZE }} />, labelKey: 'nav.myArticles', route: '/technician/articles' },
	];

	const bottomItems: NavItem[] = [
		{ id: 'settings', icon: <SettingsOutlined style={{ fontSize: ICON_SIZE }} />, labelKey: 'nav.settings', route: '/technician/settings' },
		{ id: 'help', icon: <HelpOutlineOutlined style={{ fontSize: ICON_SIZE }} />, labelKey: 'nav.help', route: '/cs' },
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
				<span className="fixora-technician-sidebar__nav-label">{t(item.labelKey)}</span>
				{item.badge != null && item.badge > 0 && (
					<span className="fixora-technician-sidebar__nav-badge">{item.badge}</span>
				)}
			</button>
		);
	};

	return (
		<aside className="fixora-technician-sidebar">
			<button
				type="button"
				className="fixora-technician-sidebar__logo"
				onClick={() => router.push('/technician/dashboard')}
			>
				<FixoraLogo size="md" className="fixora-technician-sidebar__logo-img" />
				<div className="fixora-logo-subtext">{t('nav.technicianBadge')}</div>
			</button>

			<div className="fixora-technician-sidebar__status">
				<div className="fixora-technician-sidebar__status-dot" style={{ opacity: isOnline ? 1 : 0.5 }} />
				<span className="fixora-technician-sidebar__status-text">
					{isOnline ? t('status.available') : t('status.offline')}
				</span>
			</div>

			<nav className="fixora-technician-sidebar__nav">
				<div className="fixora-technician-sidebar__section-label">{t('nav.mainMenu')}</div>
				{navItems.map(renderNavItem)}
			</nav>

			<div className="fixora-technician-sidebar__footer">
				<div className="fixora-technician-sidebar__bottom-nav">
					{bottomItems.map(renderNavItem)}
				</div>

				<button
					type="button"
					className="fixora-technician-sidebar__user-card"
					onClick={() => router.push('/technician/profile')}
				>
					<div className="fixora-technician-sidebar__user-avatar">
						{user?.memberImage
							? <img src={resolveProfileImageUrl(user.memberImage)} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
							: initials || 'T'}
					</div>
					<div className="fixora-technician-sidebar__user-info">
						<div className="fixora-technician-sidebar__user-name">{displayName}</div>
						<div className="fixora-technician-sidebar__user-role">{t('nav.proTechnician')}</div>
					</div>
					<KeyboardArrowRight style={{ fontSize: 16, color: '#606060', flexShrink: 0 }} />
				</button>
			</div>
		</aside>
	);
};

export default TechnicianSidebar;
