import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { logOut } from '../../../auth';
import SettingsTab from './SettingsTab';

export type ClientSettingsSection = 'menu' | 'profile' | 'security' | 'payment' | 'notifications' | 'location';

interface ClientSettingsTabProps {
	userId: string;
	userFullName?: string;
	userNickname?: string;
	userLocation?: string;
	userBio?: string;
	section?: ClientSettingsSection;
	onSectionChange?: (section: ClientSettingsSection) => void;
}

interface SettingsRowProps {
	icon: React.ReactNode;
	title: string;
	subtitle?: string;
	danger?: boolean;
	onClick: () => void;
}

const SettingsRow = ({ icon, title, subtitle, danger = false, onClick }: SettingsRowProps) => (
	<button type="button" className={`fixora-mypage__settings-row ${danger ? 'fixora-mypage__settings-row--danger' : ''}`} onClick={onClick}>
		<span className="fixora-mypage__settings-row-icon">{icon}</span>
		<span className="fixora-mypage__settings-row-text">
			<strong>{title}</strong>
			{subtitle && <span>{subtitle}</span>}
		</span>
		{!danger && <ChevronRightIcon className="fixora-mypage__settings-row-chevron" fontSize="small" />}
	</button>
);

const ClientSettingsTab = ({
	userId,
	userFullName,
	userNickname,
	userLocation,
	userBio,
	section = 'menu',
	onSectionChange,
}: ClientSettingsTabProps) => {
	const { t } = useTranslation('common');
	const [localSection, setLocalSection] = useState<ClientSettingsSection>(section);

	const activeSection = onSectionChange ? section : localSection;
	const setSection = (next: ClientSettingsSection) => {
		if (onSectionChange) onSectionChange(next);
		else setLocalSection(next);
	};

	if (activeSection === 'profile') {
		return (
			<div className="fixora-mypage__settings-panel">
				<button type="button" className="fixora-mypage__settings-back" onClick={() => setSection('menu')}>
					{t('mypage.settings.back')}
				</button>
				<SettingsTab
					userId={userId}
					userFullName={userFullName}
					userNickname={userNickname}
					userLocation={userLocation}
					userBio={userBio}
				/>
			</div>
		);
	}

	if (activeSection === 'security') {
		return (
			<div className="fixora-mypage__settings-panel">
				<button type="button" className="fixora-mypage__settings-back" onClick={() => setSection('menu')}>
					{t('mypage.settings.back')}
				</button>
				<div className="fixora-mypage__settings-gap">
					<p>{t('mypage.settings.securityPending')}</p>
					<span>GAP-090</span>
				</div>
			</div>
		);
	}

	if (activeSection === 'payment') {
		return (
			<div className="fixora-mypage__settings-panel">
				<button type="button" className="fixora-mypage__settings-back" onClick={() => setSection('menu')}>
					{t('mypage.settings.back')}
				</button>
				<div className="fixora-mypage__settings-gap">
					<p>{t('mypage.settings.paymentPending')}</p>
					<span>GAP-093</span>
				</div>
			</div>
		);
	}

	if (activeSection === 'notifications') {
		return (
			<div className="fixora-mypage__settings-panel">
				<button type="button" className="fixora-mypage__settings-back" onClick={() => setSection('menu')}>
					{t('mypage.settings.back')}
				</button>
				<div className="fixora-mypage__settings-gap">
					<p>{t('mypage.settings.notificationsPending')}</p>
					<span>GAP-092</span>
				</div>
			</div>
		);
	}

	if (activeSection === 'location') {
		return (
			<div className="fixora-mypage__settings-panel">
				<button type="button" className="fixora-mypage__settings-back" onClick={() => setSection('menu')}>
					{t('mypage.settings.back')}
				</button>
				<SettingsTab
					userId={userId}
					userFullName={userFullName}
					userNickname={userNickname}
					userLocation={userLocation}
					userBio={userBio}
				/>
			</div>
		);
	}

	return (
		<div className="fixora-mypage__settings-menu">
			<section className="fixora-mypage__settings-group">
				<h3 className="fixora-mypage__settings-group-label">{t('mypage.settings.account')}</h3>
				<div className="fixora-mypage__settings-card">
					<SettingsRow
						icon={<EditOutlinedIcon fontSize="small" />}
						title={t('mypage.editProfile')}
						subtitle={t('mypage.settings.editProfileSub')}
						onClick={() => setSection('profile')}
					/>
					<SettingsRow
						icon={<ShieldOutlinedIcon fontSize="small" />}
						title={t('mypage.settings.security')}
						subtitle={t('mypage.settings.securitySub')}
						onClick={() => setSection('security')}
					/>
					<SettingsRow
						icon={<CreditCardOutlinedIcon fontSize="small" />}
						title={t('mypage.settings.paymentMethods')}
						subtitle={t('mypage.settings.paymentMethodsSub')}
						onClick={() => setSection('payment')}
					/>
				</div>
			</section>

			<section className="fixora-mypage__settings-group">
				<h3 className="fixora-mypage__settings-group-label">{t('mypage.settings.preferences')}</h3>
				<div className="fixora-mypage__settings-card">
					<SettingsRow
						icon={<NotificationsNoneOutlinedIcon fontSize="small" />}
						title={t('mypage.settings.notifications')}
						subtitle={t('mypage.settings.notificationsSub')}
						onClick={() => setSection('notifications')}
					/>
					<SettingsRow
						icon={<PlaceOutlinedIcon fontSize="small" />}
						title={t('mypage.settings.location')}
						subtitle={userLocation || t('mypage.settings.locationSub')}
						onClick={() => setSection('location')}
					/>
				</div>
			</section>

			<section className="fixora-mypage__settings-group">
				<h3 className="fixora-mypage__settings-group-label">{t('mypage.settings.dangerZone')}</h3>
				<div className="fixora-mypage__settings-card">
					<SettingsRow
						icon={<LogoutOutlinedIcon fontSize="small" />}
						title={t('mypage.settings.signOut')}
						danger
						onClick={() => logOut()}
					/>
				</div>
			</section>
		</div>
	);
};

export default ClientSettingsTab;
