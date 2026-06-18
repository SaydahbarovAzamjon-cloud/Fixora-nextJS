import React from 'react';
import { useTranslation } from 'next-i18next';
import SettingsSectionHead from '../SettingsSectionHead';
import SettingsEmptyBackend from '../SettingsEmptyBackend';

const NotificationsSettingsSection: React.FC = () => {
	const { t } = useTranslation('technician');

	return (
		<div className="fts-section">
			<SettingsSectionHead title={t('settings.notifications.title')} desc={t('settings.notifications.desc')} />
			<SettingsEmptyBackend gapId="GAP-092" descKey="settings.backendPending.notifications" />
		</div>
	);
};

export default NotificationsSettingsSection;
