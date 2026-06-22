import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery } from '@apollo/client';
import SettingsSectionHead from '../SettingsSectionHead';
import SettingsSaveButton from '../SettingsSaveButton';
import SettingsToggle from '../SettingsToggle';
import {
	GET_NOTIFICATION_PREFERENCES,
	UPDATE_NOTIFICATION_PREFERENCES,
} from '../../../../../apollo/user/settings';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../../../sweetAlert';

type PrefKey =
	| 'bookingUpdates'
	| 'messages'
	| 'payments'
	| 'reviews'
	| 'marketing'
	| 'followAlerts'
	| 'emailDigest';

const PREF_KEYS: PrefKey[] = [
	'bookingUpdates',
	'messages',
	'payments',
	'reviews',
	'followAlerts',
	'emailDigest',
	'marketing',
];

const NotificationsSettingsSection: React.FC = () => {
	const { t } = useTranslation('technician');
	const { data, loading, refetch } = useQuery(GET_NOTIFICATION_PREFERENCES, {
		fetchPolicy: 'network-only',
	});
	const [updatePrefs, { loading: saving }] = useMutation(UPDATE_NOTIFICATION_PREFERENCES);

	const [prefs, setPrefs] = useState<Record<PrefKey, boolean>>({
		bookingUpdates: true,
		messages: true,
		payments: true,
		reviews: true,
		marketing: false,
		followAlerts: true,
		emailDigest: false,
	});

	useEffect(() => {
		const remote = data?.getNotificationPreferences;
		if (!remote) return;
		setPrefs({
			bookingUpdates: remote.bookingUpdates,
			messages: remote.messages,
			payments: remote.payments,
			reviews: remote.reviews,
			marketing: remote.marketing,
			followAlerts: remote.followAlerts,
			emailDigest: remote.emailDigest,
		});
	}, [data]);

	const toggle = (key: PrefKey) => {
		setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	const handleSave = async () => {
		try {
			await updatePrefs({ variables: { input: prefs } });
			await refetch();
			await sweetTopSmallSuccessAlert(t('settings.notifications.saved'), 1200);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	return (
		<div className="fts-section">
			<SettingsSectionHead title={t('settings.notifications.title')} desc={t('settings.notifications.desc')} />

			<div className="fts-card">
				{loading && !data ? (
					<p className="fts-hint">{t('settings.loading')}</p>
				) : (
					PREF_KEYS.map((key) => (
						<div key={key} className="fts-toggle-row">
							<div>
								<div className="fts-toggle-row__label">{t(`settings.notifications.prefs.${key}`)}</div>
								<div className="fts-toggle-row__hint">{t(`settings.notifications.prefs.${key}Hint`)}</div>
							</div>
							<SettingsToggle
								on={prefs[key]}
								onChange={() => toggle(key)}
								ariaLabel={t(`settings.notifications.prefs.${key}`)}
							/>
						</div>
					))
				)}
				<SettingsSaveButton onClick={handleSave} loading={saving} label={t('settings.saveChanges')} />
			</div>
		</div>
	);
};

export default NotificationsSettingsSection;
