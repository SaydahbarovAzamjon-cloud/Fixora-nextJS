import React from 'react';
import { useTranslation } from 'next-i18next';
import SettingsSectionHead from '../SettingsSectionHead';
import SettingsEmptyBackend from '../SettingsEmptyBackend';

const PreferencesSection: React.FC = () => {
	const { t } = useTranslation('technician');

	return (
		<div className="fts-section">
			<SettingsSectionHead title={t('settings.preferences.title')} desc={t('settings.preferences.desc')} />
			<SettingsEmptyBackend gapId="GAP-094" descKey="settings.backendPending.preferences" />
		</div>
	);
};

export default PreferencesSection;
