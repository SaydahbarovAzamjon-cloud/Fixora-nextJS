import React from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useReactiveVar } from '@apollo/client';
import {
	LayoutDashboard,
	ShieldCheck,
	Users,
	Calendar,
	CreditCard,
	Smartphone,
	Flag,
	Settings,
	ChevronRight,
	LogOut,
} from 'lucide-react';
import { userVar } from '../../../apollo/store';
import { logOut } from '../../auth';
import { FixoraLogo } from '../brand';
import { useAdminBadges } from '../../hooks/useAdminBadges';
import { displayUserName } from '../../hooks/useUserLookup';

const ICON_SIZE = 18;

interface NavItem {
	id: string;
	icon: React.ReactNode;
	labelKey: string;
	route: string;
	badge?: number;
}

interface AdminSidebarProps {
	className?: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ className = '' }) => {
	const { t } = useTranslation('admin');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const { verificationCount, moderationCount } = useAdminBadges();

	const displayName = displayUserName(user as Parameters<typeof displayUserName>[0]) || t('nav.admin');
	const initials = displayName.charAt(0).toUpperCase();

	const navItems: NavItem[] = [
		{ id: 'dashboard', icon: <LayoutDashboard size={ICON_SIZE} />, labelKey: 'nav.dashboard', route: '/_admin' },
		{
			id: 'verification',
			icon: <ShieldCheck size={ICON_SIZE} />,
			labelKey: 'nav.verification',
			route: '/_admin/verification',
			badge: verificationCount,
		},
		{ id: 'users', icon: <Users size={ICON_SIZE} />, labelKey: 'nav.users', route: '/_admin/users' },
		{ id: 'bookings', icon: <Calendar size={ICON_SIZE} />, labelKey: 'nav.bookings', route: '/_admin/bookings' },
		{ id: 'payments', icon: <CreditCard size={ICON_SIZE} />, labelKey: 'nav.payments', route: '/_admin/payments' },
		{ id: 'devices', icon: <Smartphone size={ICON_SIZE} />, labelKey: 'nav.devices', route: '/_admin/devices' },
		{
			id: 'moderation',
			icon: <Flag size={ICON_SIZE} />,
			labelKey: 'nav.moderation',
			route: '/_admin/moderation',
			badge: moderationCount,
		},
		{ id: 'settings', icon: <Settings size={ICON_SIZE} />, labelKey: 'nav.settings', route: '/_admin/settings' },
	];

	const isActive = (route: string) => {
		if (route === '/_admin') return router.pathname === '/_admin';
		return router.pathname.startsWith(route);
	};

	const handleLogout = () => {
		logOut();
		router.push('/login').then();
	};

	return (
		<aside className={`fixora-admin-sidebar ${className}`.trim()}>
			<button type="button" className="fixora-admin-sidebar__brand" onClick={() => router.push('/_admin')}>
				<FixoraLogo size="sm" className="fixora-admin-sidebar__logo" />
				<div className="fixora-admin-sidebar__brand-text">
					<span className="fixora-admin-sidebar__brand-name">Fixora</span>
					<span className="fixora-admin-sidebar__brand-sub">{t('nav.console')}</span>
				</div>
			</button>

			<nav className="fixora-admin-sidebar__nav">
				{navItems.map((item) => {
					const active = isActive(item.route);
					return (
						<button
							key={item.id}
							type="button"
							className={`fixora-admin-sidebar__nav-item${active ? ' fixora-admin-sidebar__nav-item--active' : ''}`}
							onClick={() => router.push(item.route)}
						>
							<span className="fixora-admin-sidebar__nav-icon">{item.icon}</span>
							<span className="fixora-admin-sidebar__nav-label">{t(item.labelKey)}</span>
							{item.badge != null && item.badge > 0 && (
								<span className="fixora-admin-sidebar__nav-badge">{item.badge}</span>
							)}
							{active && <ChevronRight size={14} className="fixora-admin-sidebar__nav-chevron" />}
						</button>
					);
				})}
			</nav>

			<div className="fixora-admin-sidebar__footer">
				<div className="fixora-admin-sidebar__profile">
					<div className="fixora-admin-sidebar__avatar">{initials}</div>
					<div className="fixora-admin-sidebar__profile-info">
						<span className="fixora-admin-sidebar__profile-name">{displayName}</span>
						<span className="fixora-admin-sidebar__profile-role">{t('nav.superAdmin')}</span>
					</div>
					<button type="button" className="fixora-admin-sidebar__logout" onClick={handleLogout} aria-label={t('nav.logout')}>
						<LogOut size={16} />
					</button>
				</div>
			</div>
		</aside>
	);
};

export default AdminSidebar;
