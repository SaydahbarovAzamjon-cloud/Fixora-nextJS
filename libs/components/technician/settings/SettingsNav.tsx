import React from 'react';
import { useTranslation } from 'next-i18next';
import PersonOutlineOutlined from '@mui/icons-material/PersonOutlineOutlined';
import TuneOutlined from '@mui/icons-material/TuneOutlined';
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import CreditCardOutlined from '@mui/icons-material/CreditCardOutlined';
import CalendarTodayOutlined from '@mui/icons-material/CalendarTodayOutlined';
import LanguageOutlined from '@mui/icons-material/LanguageOutlined';
import DeleteOutlineOutlined from '@mui/icons-material/DeleteOutlineOutlined';
import { SettingsSectionId } from './types';

interface SettingsNavProps {
	active: SettingsSectionId;
	onChange: (id: SettingsSectionId) => void;
}

const NAV_ITEMS: { id: SettingsSectionId; icon: React.ReactNode; labelKey: string }[] = [
	{ id: 'profile', icon: <PersonOutlineOutlined style={{ fontSize: 15 }} />, labelKey: 'settings.nav.profile' },
	{ id: 'account', icon: <TuneOutlined style={{ fontSize: 15 }} />, labelKey: 'settings.nav.account' },
	{ id: 'notifications', icon: <NotificationsNoneOutlined style={{ fontSize: 15 }} />, labelKey: 'settings.nav.notifications' },
	{ id: 'security', icon: <LockOutlined style={{ fontSize: 15 }} />, labelKey: 'settings.nav.security' },
	{ id: 'payment', icon: <CreditCardOutlined style={{ fontSize: 15 }} />, labelKey: 'settings.nav.payment' },
	{ id: 'availability', icon: <CalendarTodayOutlined style={{ fontSize: 15 }} />, labelKey: 'settings.nav.availability' },
	{ id: 'preferences', icon: <LanguageOutlined style={{ fontSize: 15 }} />, labelKey: 'settings.nav.preferences' },
];

const SettingsNav: React.FC<SettingsNavProps> = ({ active, onChange }) => {
	const { t } = useTranslation('technician');

	return (
		<nav className="fts-nav" aria-label={t('settings.nav.aria')}>
			<div className="fts-nav__list">
				{NAV_ITEMS.map(({ id, icon, labelKey }) => {
					const isActive = active === id;
					return (
						<button
							key={id}
							type="button"
							className={`fts-nav__item ${isActive ? 'fts-nav__item--active' : ''}`}
							onClick={() => onChange(id)}
						>
							{icon}
							{t(labelKey)}
						</button>
					);
				})}
			</div>
			<div className="fts-nav__danger">
				<button
					type="button"
					className={`fts-nav__item fts-nav__item--danger ${active === 'danger' ? 'fts-nav__item--danger-active' : ''}`}
					onClick={() => onChange('danger')}
				>
					<DeleteOutlineOutlined style={{ fontSize: 15 }} />
					{t('settings.nav.deleteAccount')}
				</button>
			</div>
		</nav>
	);
};

export default SettingsNav;
