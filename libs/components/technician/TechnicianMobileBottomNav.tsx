import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import BuildOutlined from '@mui/icons-material/BuildOutlined';
import MailOutline from '@mui/icons-material/MailOutline';
import WorkOutlineOutlined from '@mui/icons-material/WorkOutlineOutlined';
import ChatBubbleOutlineOutlined from '@mui/icons-material/ChatBubbleOutlineOutlined';
import MoreHorizOutlined from '@mui/icons-material/MoreHorizOutlined';
import PersonOutlineOutlined from '@mui/icons-material/PersonOutlineOutlined';
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined';
import BarChartOutlined from '@mui/icons-material/BarChartOutlined';
import AttachMoneyOutlined from '@mui/icons-material/AttachMoneyOutlined';
import MenuBookOutlined from '@mui/icons-material/MenuBookOutlined';
import ArticleOutlined from '@mui/icons-material/ArticleOutlined';
import SettingsOutlined from '@mui/icons-material/SettingsOutlined';
import HelpOutlineOutlined from '@mui/icons-material/HelpOutlineOutlined';
import useTechnicianBadges from '../../hooks/useTechnicianBadges';

interface TechnicianMobileBottomNavProps {
	activePage: string;
}

const ICON = 20;

const PRIMARY_NAV = [
	{ id: 'dashboard', route: '/technician/dashboard', icon: <BuildOutlined style={{ fontSize: ICON }} />, labelKey: 'nav.dashboard' },
	{ id: 'requests', route: '/technician/requests', icon: <MailOutline style={{ fontSize: ICON }} />, labelKey: 'nav.requests', badgeKey: 'requests' as const },
	{ id: 'jobs', route: '/technician/jobs', icon: <WorkOutlineOutlined style={{ fontSize: ICON }} />, labelKey: 'nav.jobs', badgeKey: 'jobs' as const },
	{ id: 'messages', route: '/technician/messages', icon: <ChatBubbleOutlineOutlined style={{ fontSize: ICON }} />, labelKey: 'nav.messages', badgeKey: 'messages' as const },
] as const;

const MORE_NAV = [
	{ id: 'notifications', route: '/technician/notifications', icon: <NotificationsNoneOutlined style={{ fontSize: ICON }} />, labelKey: 'nav.notifications', badgeKey: 'notifications' as const },
	{ id: 'profile', route: '/technician/profile', icon: <PersonOutlineOutlined style={{ fontSize: ICON }} />, labelKey: 'nav.profile' },
	{ id: 'analytics', route: '/technician/analytics', icon: <BarChartOutlined style={{ fontSize: ICON }} />, labelKey: 'nav.analytics' },
	{ id: 'earnings', route: '/technician/earnings', icon: <AttachMoneyOutlined style={{ fontSize: ICON }} />, labelKey: 'nav.earnings' },
	{ id: 'write', route: '/technician/write', icon: <MenuBookOutlined style={{ fontSize: ICON }} />, labelKey: 'nav.writeArticle' },
	{ id: 'articles', route: '/technician/articles', icon: <ArticleOutlined style={{ fontSize: ICON }} />, labelKey: 'nav.myArticles' },
	{ id: 'settings', route: '/technician/settings', icon: <SettingsOutlined style={{ fontSize: ICON }} />, labelKey: 'nav.settings' },
	{ id: 'help', route: '/technician/help', icon: <HelpOutlineOutlined style={{ fontSize: ICON }} />, labelKey: 'nav.help' },
] as const;

const TechnicianMobileBottomNav: React.FC<TechnicianMobileBottomNavProps> = ({ activePage }) => {
	const { t } = useTranslation('technician');
	const router = useRouter();
	const badges = useTechnicianBadges();
	const [moreOpen, setMoreOpen] = useState(false);

	const moreActive = MORE_NAV.some((item) => item.id === activePage);

	const navigate = (route: string) => {
		setMoreOpen(false);
		router.push(route);
	};

	return (
		<>
			<nav className="fixora-tech-mobile-nav" aria-label={t('nav.mainMenu')}>
				{PRIMARY_NAV.map((item) => {
					const badge = 'badgeKey' in item && item.badgeKey ? badges[item.badgeKey] : 0;
					return (
						<button
							key={item.id}
							type="button"
							className={`fixora-tech-mobile-nav__item${activePage === item.id ? ' fixora-tech-mobile-nav__item--active' : ''}`}
							onClick={() => navigate(item.route)}
						>
							<span className="fixora-tech-mobile-nav__icon-wrap">
								{item.icon}
								{badge > 0 && (
									<span className="fixora-nav__badge">{badge > 9 ? '9+' : badge}</span>
								)}
							</span>
							<span>{t(item.labelKey)}</span>
						</button>
					);
				})}
				<button
					type="button"
					className={`fixora-tech-mobile-nav__item${moreActive ? ' fixora-tech-mobile-nav__item--active' : ''}`}
					onClick={() => setMoreOpen(true)}
					aria-expanded={moreOpen}
				>
					<MoreHorizOutlined style={{ fontSize: ICON }} />
					<span>{t('nav.more')}</span>
				</button>
			</nav>

			{moreOpen && (
				<div className="fixora-tech-mobile-more" role="dialog" aria-modal="true" aria-label={t('nav.more')}>
					<button type="button" className="fixora-tech-mobile-more__backdrop" onClick={() => setMoreOpen(false)} aria-label={t('nav.closeMenu')} />
					<div className="fixora-tech-mobile-more__sheet">
						<p className="fixora-tech-mobile-more__title">{t('nav.more')}</p>
						<div className="fixora-tech-mobile-more__grid">
							{MORE_NAV.map((item) => {
								const badge = 'badgeKey' in item && item.badgeKey ? badges[item.badgeKey] : 0;
								return (
									<button
										key={item.id}
										type="button"
										className={`fixora-tech-mobile-more__link${activePage === item.id ? ' fixora-tech-mobile-more__link--active' : ''}`}
										onClick={() => navigate(item.route)}
									>
										<span className="fixora-tech-mobile-nav__icon-wrap">
											{item.icon}
											{badge > 0 && (
												<span className="fixora-nav__badge">{badge > 9 ? '9+' : badge}</span>
											)}
										</span>
										<span>{t(item.labelKey)}</span>
									</button>
								);
							})}
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default TechnicianMobileBottomNav;
