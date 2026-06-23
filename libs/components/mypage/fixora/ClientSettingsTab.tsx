import React, { useState } from 'react';

import { useTranslation } from 'next-i18next';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';

import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';

import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';

import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';

import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';

import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';

import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import { logOut } from '../../../auth';

import SettingsTab from './SettingsTab';

import ClientSecurityPanel from './ClientSecurityPanel';

import ClientAccountPanel from './ClientAccountPanel';

import NotificationsSettingsSection from '../../technician/settings/sections/NotificationsSettingsSection';

import PaymentMethodsSection from '../../technician/settings/sections/PaymentMethodsSection';

import PreferencesSection from '../../technician/settings/sections/PreferencesSection';

import DeleteAccountSection from '../../technician/settings/sections/DeleteAccountSection';



export type ClientSettingsSection =

	| 'menu'

	| 'profile'

	| 'account'

	| 'security'

	| 'payment'

	| 'notifications'

	| 'preferences'

	| 'location'

	| 'delete';



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



const SettingsPanel = ({
	onBack,
	children,
}: {
	onBack: () => void;
	children: React.ReactNode;
}) => {

	const { t } = useTranslation('common');

	return (

		<div className="fixora-mypage__settings-panel">

			<button type="button" className="fixora-mypage__settings-back" onClick={onBack}>

				{t('mypage.settings.back')}

			</button>

			{children}

		</div>

	);

};



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



	const back = () => setSection('menu');



	if (activeSection === 'profile') {

		return (

			<SettingsPanel onBack={back}>

				<SettingsTab

					userId={userId}

					userFullName={userFullName}

					userNickname={userNickname}

					userLocation={userLocation}

					userBio={userBio}

				/>

			</SettingsPanel>

		);

	}



	if (activeSection === 'account') {

		return (

			<SettingsPanel onBack={back}>

				<ClientAccountPanel />

			</SettingsPanel>

		);

	}



	if (activeSection === 'security') {

		return (

			<SettingsPanel onBack={back}>

				<ClientSecurityPanel />

			</SettingsPanel>

		);

	}



	if (activeSection === 'payment') {

		return (

			<SettingsPanel onBack={back}>

				<PaymentMethodsSection />

			</SettingsPanel>

		);

	}



	if (activeSection === 'notifications') {

		return (

			<SettingsPanel onBack={back}>

				<NotificationsSettingsSection />

			</SettingsPanel>

		);

	}



	if (activeSection === 'preferences') {

		return (

			<SettingsPanel onBack={back}>

				<PreferencesSection />

			</SettingsPanel>

		);

	}



	if (activeSection === 'location') {

		return (

			<SettingsPanel onBack={back}>

				<SettingsTab

					userId={userId}

					userFullName={userFullName}

					userNickname={userNickname}

					userLocation={userLocation}

					userBio={userBio}

				/>

			</SettingsPanel>

		);

	}



	if (activeSection === 'delete') {

		return (

			<SettingsPanel onBack={back}>

				<DeleteAccountSection />

			</SettingsPanel>

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

						icon={<EmailOutlinedIcon fontSize="small" />}

						title={t('mypage.settings.accountEmail')}

						subtitle={t('mypage.settings.accountEmailSub')}

						onClick={() => setSection('account')}

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

						icon={<TuneOutlinedIcon fontSize="small" />}

						title={t('mypage.settings.appPreferences')}

						subtitle={t('mypage.settings.appPreferencesSub')}

						onClick={() => setSection('preferences')}

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

					<SettingsRow

						icon={<DeleteOutlineOutlinedIcon fontSize="small" />}

						title={t('mypage.settings.deleteAccount')}

						subtitle={t('mypage.settings.deleteAccountSub')}

						danger

						onClick={() => setSection('delete')}

					/>

				</div>

			</section>

		</div>

	);

};



export default ClientSettingsTab;

