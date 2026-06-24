import React from 'react';
import { useTranslation } from 'next-i18next';
import { Menu, X } from 'lucide-react';
import AdminNotificationBell from './AdminNotificationBell';
import AdminUserMenuButton from './AdminUserMenuButton';

export interface AdminMobileTopBarProps {
	sidebarOpen: boolean;
	onMenuToggle: () => void;
}

const AdminMobileTopBar: React.FC<AdminMobileTopBarProps> = ({ sidebarOpen, onMenuToggle }) => {
	const { t } = useTranslation('admin');

	return (
		<div className="fixora-admin-mobile-topbar">
			<button
				type="button"
				className="fixora-admin-mobile-topbar__menu"
				onClick={onMenuToggle}
				aria-label={sidebarOpen ? t('nav.closeMenu') : t('nav.openMenu')}
				aria-expanded={sidebarOpen}
			>
				{sidebarOpen ? <X size={20} /> : <Menu size={20} />}
			</button>

			<div className="fixora-admin-mobile-topbar__spacer" aria-hidden />

			<div className="fixora-admin-mobile-topbar__actions">
				<AdminNotificationBell />
				<AdminUserMenuButton variant="avatar" />
			</div>
		</div>
	);
};

export default AdminMobileTopBar;
