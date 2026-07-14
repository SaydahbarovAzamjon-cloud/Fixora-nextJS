import React, { useEffect, useRef, useState } from 'react';
import { useMutation } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckIcon from '@mui/icons-material/Check';
import {
	DEFAULT_NOTIFICATION_SETUP,
	DEFAULT_NOTIFICATION_PREFERENCES,
	NotificationLocale,
	NotificationSetupInput,
	writeNotificationPreferencesCache,
} from '../../auth/notificationPreferencesCache';
import { UPDATE_NOTIFICATION_PREFERENCES } from '../../../apollo/user/settings';
import { getJwtToken } from '../../auth/tokens';
import { resolveAuthUser } from '../../utils/authSession';

interface NotificationSetupCardProps {
	value: NotificationSetupInput;
	onChange: (next: NotificationSetupInput) => void;
	hasEmail?: boolean;
}

const LANGUAGE_OPTIONS: { value: NotificationLocale; label: string }[] = [
	{ value: 'ko', label: '한국어' },
	{ value: 'en', label: 'English' },
];

/**
 * Signup / OAuth soft preferences — language + email only.
 * Telegram Connect sits below this card on the same form.
 * When a Bearer session exists, language changes persist immediately (Telegram templates).
 */
const NotificationSetupCard = ({
	value,
	onChange,
	hasEmail = true,
}: NotificationSetupCardProps) => {
	const { t } = useTranslation('auth');
	const setup = { ...DEFAULT_NOTIFICATION_SETUP, ...value };
	const [open, setOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement>(null);
	const [updatePrefs] = useMutation(UPDATE_NOTIFICATION_PREFERENCES);

	useEffect(() => {
		if (!open) return;
		const onDoc = (e: MouseEvent) => {
			if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setOpen(false);
		};
		document.addEventListener('mousedown', onDoc);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('mousedown', onDoc);
			document.removeEventListener('keydown', onKey);
		};
	}, [open]);

	const persistLanguage = async (notificationLanguage: NotificationLocale) => {
		const token = getJwtToken();
		if (!token) return;
		const userId = resolveAuthUser()?._id;
		try {
			await updatePrefs({
				variables: { input: { notificationLanguage } },
			});
			if (userId) {
				writeNotificationPreferencesCache(userId, {
					...DEFAULT_NOTIFICATION_PREFERENCES,
					...setup,
					notificationLanguage,
					emailEnabled: Boolean(setup.emailEnabled ?? true),
					telegramEnabled: Boolean(setup.telegramEnabled),
				});
			}
		} catch {
			/* soft — signup payload still carries language */
		}
	};

	const handleLanguage = (notificationLanguage: NotificationLocale) => {
		onChange({ ...setup, notificationLanguage });
		setOpen(false);
		void persistLanguage(notificationLanguage);
	};

	const current =
		LANGUAGE_OPTIONS.find((o) => o.value === (setup.notificationLanguage ?? 'ko')) ??
		LANGUAGE_OPTIONS[0];

	return (
		<div className="auth-notif-setup">
			<div className="auth-notif-setup__head">
				<NotificationsOutlinedIcon fontSize="small" />
				<strong>{t('notificationSetup.title')}</strong>
			</div>
			<p className="auth-notif-setup__desc">{t('notificationSetup.desc')}</p>

			<div className="auth-notif-setup__field" ref={rootRef}>
				<span id="notif-lang-label">{t('notificationSetup.language')}</span>
				<button
					type="button"
					className={`auth-notif-setup__lang-btn${open ? ' is-open' : ''}`}
					aria-haspopup="listbox"
					aria-expanded={open}
					aria-labelledby="notif-lang-label"
					onClick={() => setOpen((v) => !v)}
				>
					<span>{current.label}</span>
					<ExpandMoreIcon fontSize="small" />
				</button>
				{open && (
					<ul className="auth-notif-setup__lang-menu" role="listbox">
						{LANGUAGE_OPTIONS.map((opt) => {
							const selected = opt.value === current.value;
							return (
								<li key={opt.value} role="option" aria-selected={selected}>
									<button
										type="button"
										className={`auth-notif-setup__lang-option${selected ? ' is-selected' : ''}`}
										onClick={() => handleLanguage(opt.value)}
									>
										<span>{opt.label}</span>
										{selected && <CheckIcon fontSize="small" />}
									</button>
								</li>
							);
						})}
					</ul>
				)}
			</div>

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
		</div>
	);
};

export default NotificationSetupCard;

export function buildNotificationSetupPayload(
	setup: NotificationSetupInput,
): NotificationSetupInput | undefined {
	const notificationLanguage: NotificationLocale =
		setup.notificationLanguage === 'ko' ? 'ko' : 'en';
	return {
		emailEnabled: setup.emailEnabled ?? true,
		notificationLanguage,
		telegramEnabled: false,
	};
}

export function isNotificationSetupValid(_setup: NotificationSetupInput): boolean {
	return true;
}
