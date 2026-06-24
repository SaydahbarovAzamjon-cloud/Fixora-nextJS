import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import SettingsSectionHead from '../SettingsSectionHead';
import SettingsSaveButton from '../SettingsSaveButton';
import SettingsToggle from '../SettingsToggle';
import {
	GET_NOTIFICATION_PREFERENCES,
	UPDATE_NOTIFICATION_PREFERENCES,
} from '../../../../../apollo/user/settings';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../../../sweetAlert';
import { userVar } from '../../../../../apollo/store';
import {
	DEFAULT_NOTIFICATION_PREFERENCES,
	NotificationPreferences,
	readNotificationPreferencesCache,
	writeNotificationPreferencesCache,
} from '../../../../auth/notificationPreferencesCache';

type PrefKey = keyof NotificationPreferences;

const PREF_KEYS: PrefKey[] = [
	'bookingUpdates',
	'messages',
	'payments',
	'reviews',
	'followAlerts',
	'emailDigest',
	'marketing',
];

function prefsEqual(a: NotificationPreferences, b: NotificationPreferences): boolean {
	return PREF_KEYS.every((key) => a[key] === b[key]);
}

const NotificationsSettingsSection: React.FC = () => {
	const { t } = useTranslation('technician');
	const user = useReactiveVar(userVar);
	const userId = user?._id ?? '';

	const { data, loading, error, refetch } = useQuery(GET_NOTIFICATION_PREFERENCES, {
		fetchPolicy: 'network-only',
	});
	const [updatePrefs, { loading: saving }] = useMutation(UPDATE_NOTIFICATION_PREFERENCES);

	const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);
	const [savedPrefs, setSavedPrefs] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);
	const [usingLocalFallback, setUsingLocalFallback] = useState(false);

	const dirty = useMemo(() => !prefsEqual(prefs, savedPrefs), [prefs, savedPrefs]);

	useEffect(() => {
		const remote = data?.getNotificationPreferences;
		if (remote) {
			const next: NotificationPreferences = {
				bookingUpdates: remote.bookingUpdates ?? true,
				messages: remote.messages ?? true,
				payments: remote.payments ?? true,
				reviews: remote.reviews ?? true,
				marketing: remote.marketing ?? false,
				followAlerts: remote.followAlerts ?? true,
				emailDigest: remote.emailDigest ?? false,
			};
			setPrefs(next);
			setSavedPrefs(next);
			setUsingLocalFallback(false);
			if (userId) writeNotificationPreferencesCache(userId, next);
			return;
		}

		if (!loading && error && userId) {
			const cached = readNotificationPreferencesCache(userId);
			if (cached) {
				setPrefs(cached);
				setSavedPrefs(cached);
				setUsingLocalFallback(true);
			}
		}
	}, [data, loading, error, userId]);

	const toggle = (key: PrefKey) => {
		setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	const handleSave = async () => {
		try {
			await updatePrefs({ variables: { input: prefs } });
			await refetch();
			setSavedPrefs(prefs);
			setUsingLocalFallback(false);
			if (userId) writeNotificationPreferencesCache(userId, prefs);
			await sweetTopSmallSuccessAlert(t('settings.notifications.saved'), 1200);
		} catch (err) {
			if (userId) {
				writeNotificationPreferencesCache(userId, prefs);
				setSavedPrefs(prefs);
				setUsingLocalFallback(true);
				await sweetTopSmallSuccessAlert(t('settings.notifications.savedOffline'), 1600);
				return;
			}
			await sweetErrorHandling(err);
		}
	};

	return (
		<div className="fts-section">
			<SettingsSectionHead title={t('settings.notifications.title')} desc={t('settings.notifications.desc')} />

			{usingLocalFallback && (
				<div className="fts-offline-banner" role="status">
					{t('settings.notifications.offlineBanner')}
				</div>
			)}

			<div className="fts-card">
				{loading && !data && !usingLocalFallback ? (
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
				<SettingsSaveButton
					onClick={handleSave}
					loading={saving}
					disabled={!dirty}
					label={t('settings.saveChanges')}
				/>
			</div>
		</div>
	);
};

export default NotificationsSettingsSection;
