import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import {
	DEFAULT_NOTIFICATION_SETUP,
	isValidTelegramUsernameFormat,
	NotificationSetupInput,
	normalizeTelegramUsername,
} from '../../auth/notificationPreferencesCache';

interface NotificationSetupCardProps {
	value: NotificationSetupInput;
	onChange: (next: NotificationSetupInput) => void;
	hasEmail?: boolean;
}

/**
 * Signup / OAuth soft preferences — language, email, optional Telegram username (intent only).
 * Delivery requires Connect Telegram in Settings after signup.
 */
const NotificationSetupCard = ({
	value,
	onChange,
	hasEmail = true,
}: NotificationSetupCardProps) => {
	const { t } = useTranslation('auth');
	const [usernameError, setUsernameError] = useState(false);

	const setup = { ...DEFAULT_NOTIFICATION_SETUP, ...value };

	const handleUsername = (raw: string) => {
		const cleaned = raw.replace(/^@+/, '');
		onChange({
			...setup,
			telegramUsername: cleaned,
			telegramEnabled: Boolean(normalizeTelegramUsername(cleaned)),
		});
		setUsernameError(cleaned.length > 0 && !isValidTelegramUsernameFormat(cleaned));
	};

	return (
		<div className="auth-notif-setup">
			<div className="auth-notif-setup__head">
				<NotificationsOutlinedIcon fontSize="small" />
				<strong>{t('notificationSetup.title')}</strong>
			</div>
			<p className="auth-notif-setup__desc">{t('notificationSetup.desc')}</p>

			<label className="auth-notif-setup__field">
				<span>{t('notificationSetup.language')}</span>
				<select
					className="auth-notif-setup__select"
					value={setup.notificationLanguage ?? 'ko'}
					onChange={(e) =>
						onChange({
							...setup,
							notificationLanguage: e.target.value as 'ko' | 'en',
						})
					}
				>
					<option value="ko">한국어</option>
					<option value="en">English</option>
				</select>
			</label>

			{hasEmail && (
				<label className="auth-notif-setup__row">
					<span>{t('notificationSetup.email')}</span>
					<input
						type="checkbox"
						checked={Boolean(setup.emailEnabled)}
						onChange={(e) => onChange({ ...setup, emailEnabled: e.target.checked })}
					/>
				</label>
			)}

			<label className="auth-notif-setup__field">
				<span>{t('notificationSetup.telegramUsername')}</span>
				<input
					type="text"
					className="auth-notif-setup__input"
					placeholder={t('notificationSetup.telegramPlaceholder')}
					value={setup.telegramUsername ?? ''}
					onChange={(e) => handleUsername(e.target.value)}
					autoComplete="off"
				/>
			</label>
			{usernameError ? (
				<p className="auth-notif-setup__error">{t('notificationSetup.telegramInvalid')}</p>
			) : (
				<p className="auth-notif-setup__hint">{t('notificationSetup.telegramHint')}</p>
			)}
			<p className="auth-notif-setup__steps">{t('notificationSetup.telegramSteps')}</p>
		</div>
	);
};

export default NotificationSetupCard;

export function buildNotificationSetupPayload(
	setup: NotificationSetupInput,
): NotificationSetupInput | undefined {
	const username = normalizeTelegramUsername(setup.telegramUsername ?? '');
	if (username && !isValidTelegramUsernameFormat(username)) {
		return undefined;
	}
	const payload: NotificationSetupInput = {
		emailEnabled: setup.emailEnabled ?? true,
		notificationLanguage: setup.notificationLanguage ?? 'ko',
		telegramEnabled: Boolean(username) || Boolean(setup.telegramEnabled),
	};
	if (username) payload.telegramUsername = username;
	return payload;
}

export function isNotificationSetupValid(setup: NotificationSetupInput): boolean {
	return isValidTelegramUsernameFormat(setup.telegramUsername ?? '');
}
