import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery } from '@apollo/client';
import SettingsSectionHead from '../SettingsSectionHead';
import SettingsField from '../SettingsField';
import SettingsSaveButton from '../SettingsSaveButton';
import SettingsToggle from '../SettingsToggle';
import { GET_USER_PREFERENCES, UPDATE_USER_PREFERENCES } from '../../../../../apollo/user/settings';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../../../sweetAlert';
import { useFixoraTheme } from '../../../theme/FixoraThemeProvider';

const PreferencesSection: React.FC = () => {
	const { t } = useTranslation('technician');
	const { setMode } = useFixoraTheme();
	const { data, loading, refetch } = useQuery(GET_USER_PREFERENCES, { fetchPolicy: 'network-only' });
	const [updatePrefs, { loading: saving }] = useMutation(UPDATE_USER_PREFERENCES);

	const [language, setLanguage] = useState('en');
	const [currency, setCurrency] = useState('KRW');
	const [timezone, setTimezone] = useState('Asia/Seoul');
	const [darkMode, setDarkMode] = useState(false);

	useEffect(() => {
		const remote = data?.getUserPreferences;
		if (!remote) return;
		setLanguage(remote.language || 'en');
		setCurrency(remote.currency || 'KRW');
		setTimezone(remote.timezone || 'Asia/Seoul');
		// Form only — do not push remote darkMode into global theme on open (causes light/dark mix).
		setDarkMode(remote.darkMode === true);
	}, [data]);

	const handleSave = async () => {
		try {
			const nextMode = darkMode ? 'dark' : 'light';
			await updatePrefs({
				variables: { input: { language, currency, timezone, darkMode } },
			});
			setMode(nextMode);
			await refetch();
			await sweetTopSmallSuccessAlert(t('settings.preferences.saved'), 1200);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	return (
		<div className="fts-section">
			<SettingsSectionHead title={t('settings.preferences.title')} desc={t('settings.preferences.desc')} />

			<div className="fts-card">
				{loading && !data ? (
					<p className="fts-hint">{t('settings.loading')}</p>
				) : (
					<>
						<SettingsField label={t('settings.preferences.language')}>
							<select className="fts-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
								<option value="en">English</option>
								<option value="kr">한국어</option>
							</select>
						</SettingsField>
						<SettingsField label={t('settings.preferences.currency')}>
							<select className="fts-select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
								<option value="KRW">KRW (₩)</option>
								<option value="USD">USD ($)</option>
							</select>
						</SettingsField>
						<SettingsField label={t('settings.preferences.timezone')}>
							<select className="fts-select" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
								<option value="Asia/Seoul">Asia/Seoul</option>
								<option value="UTC">UTC</option>
							</select>
						</SettingsField>
						<div className="fts-toggle-row">
							<span>{t('settings.preferences.darkMode')}</span>
							<SettingsToggle
								on={darkMode}
								onChange={() => setDarkMode((prev) => !prev)}
								ariaLabel={t('settings.preferences.darkMode')}
							/>
						</div>
					</>
				)}
				<SettingsSaveButton onClick={handleSave} loading={saving} label={t('settings.saveChanges')} />
			</div>
		</div>
	);
};

export default PreferencesSection;
