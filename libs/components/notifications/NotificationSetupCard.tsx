import React from 'react';
import { useTranslation } from 'next-i18next';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import {
	DEFAULT_NOTIFICATION_PREFERENCES,
	NotificationPreferences,
} from '../../auth/notificationPreferencesCache';

type PrefKey = 'bookingUpdates' | 'messages' | 'payments' | 'reviews';

const SETUP_KEYS: PrefKey[] = ['bookingUpdates', 'messages', 'payments', 'reviews'];

interface NotificationSetupCardProps {
	prefs: NotificationPreferences;
	onChange: (prefs: NotificationPreferences) => void;
}

/**
 * Signup / OAuth onboarding — choose which notification channels to enable.
 * Applied via `updateNotificationPreferences` after account creation (schema has no signup embed).
 */
const NotificationSetupCard = ({ prefs, onChange }: NotificationSetupCardProps) => {
	const { t } = useTranslation('auth');

	const toggle = (key: PrefKey) => {
		onChange({ ...prefs, [key]: !prefs[key] });
	};

	return (
		<div className="auth-notif-setup">
			<div className="auth-notif-setup__head">
				<NotificationsOutlinedIcon fontSize="small" />
				<strong>{t('notificationSetup.title')}</strong>
			</div>
			<p className="auth-notif-setup__desc">{t('notificationSetup.desc')}</p>
			<div className="auth-notif-setup__toggles">
				{SETUP_KEYS.map((key) => (
					<label key={key} className="auth-notif-setup__row">
						<span>{t(`notificationSetup.prefs.${key}`)}</span>
						<input
							type="checkbox"
							checked={prefs[key] ?? DEFAULT_NOTIFICATION_PREFERENCES[key]}
							onChange={() => toggle(key)}
						/>
					</label>
				))}
			</div>
		</div>
	);
};

export default NotificationSetupCard;
