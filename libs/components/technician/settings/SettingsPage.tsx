import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../../apollo/store';
import { useTechnicianSettings } from '../../../hooks/useTechnicianSettings';
import SettingsNav from './SettingsNav';
import { parseSettingsSection, SettingsSectionId } from './types';
import ProfileSettingsSection from './sections/ProfileSettingsSection';
import AccountSettingsSection from './sections/AccountSettingsSection';
import NotificationsSettingsSection from './sections/NotificationsSettingsSection';
import SecuritySettingsSection from './sections/SecuritySettingsSection';
import PaymentMethodsSection from './sections/PaymentMethodsSection';
import AvailabilitySection from './sections/AvailabilitySection';
import PreferencesSection from './sections/PreferencesSection';
import DeleteAccountSection from './sections/DeleteAccountSection';
import SettingsEmptyBackend from './SettingsEmptyBackend';

const SettingsPage: React.FC = () => {
	const { t } = useTranslation('technician');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const userId = user?._id;

	const [activeSection, setActiveSection] = useState<SettingsSectionId>('profile');

	const {
		user: settingsUser,
		loading,
		error,
		refetch,
		saving,
		profileForm,
		patchProfile,
		nickname,
		setNickname,
		availability,
		patchAvailability,
		toggleDay,
		saveProfile,
		saveAccount,
		saveAvailability,
		savePassword,
	} = useTechnicianSettings(userId);

	useEffect(() => {
		if (!router.isReady) return;
		setActiveSection(parseSettingsSection(router.query.section));
	}, [router.isReady, router.query.section]);

	const changeSection = (id: SettingsSectionId) => {
		setActiveSection(id);
		router.replace({ pathname: '/technician/settings', query: id === 'profile' ? {} : { section: id } }, undefined, {
			shallow: true,
		});
	};

	if (!userId) {
		return (
			<div className="fts-page fts-page--center">
				<p>{t('settings.loading')}</p>
			</div>
		);
	}

	if (loading && !settingsUser) {
		return (
			<div className="fts-page">
				<div className="fts-page__skeleton fts-page__skeleton--nav" />
				<div className="fts-page__skeleton fts-page__skeleton--content" />
			</div>
		);
	}

	if (error && !settingsUser) {
		return (
			<div className="fts-page fts-page--center">
				<SettingsEmptyBackend gapId="GET_USER" onRetry={() => refetch()} descKey="settings.loadError" titleKey="settings.loadErrorTitle" />
			</div>
		);
	}

	return (
		<div className="fts-page">
			<SettingsNav active={activeSection} onChange={changeSection} />
			<div className="fts-page__content">
				<div className="fts-page__inner">
					{activeSection === 'profile' && (
						<ProfileSettingsSection
							user={settingsUser}
							form={profileForm}
							onChange={patchProfile}
							onSave={saveProfile}
							saving={saving}
						/>
					)}
					{activeSection === 'account' && (
						<AccountSettingsSection
							user={settingsUser}
							nickname={nickname}
							onNicknameChange={setNickname}
							onSave={saveAccount}
							saving={saving}
						/>
					)}
					{activeSection === 'notifications' && <NotificationsSettingsSection />}
					{activeSection === 'security' && (
						<SecuritySettingsSection
							onSavePassword={savePassword}
							saving={saving}
							userEmail={settingsUser?.userEmail}
							userPhone={settingsUser?.userPhoneNumber}
						/>
					)}
					{activeSection === 'payment' && <PaymentMethodsSection />}
					{activeSection === 'availability' && (
						<AvailabilitySection
							availability={availability}
							onToggleDay={toggleDay}
							onStartTime={(v) => patchAvailability({ startTime: v })}
							onEndTime={(v) => patchAvailability({ endTime: v })}
							onSave={saveAvailability}
							saving={saving}
						/>
					)}
					{activeSection === 'preferences' && <PreferencesSection />}
					{activeSection === 'danger' && <DeleteAccountSection />}
				</div>
			</div>
		</div>
	);
};

export default SettingsPage;
