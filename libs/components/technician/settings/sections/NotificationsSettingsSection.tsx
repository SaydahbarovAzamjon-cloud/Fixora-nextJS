import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import SettingsSectionHead from '../SettingsSectionHead';
import SettingsSaveButton from '../SettingsSaveButton';
import SettingsToggle from '../SettingsToggle';
import SettingsField from '../SettingsField';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../../../sweetAlert';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../../../apollo/store';
import {
	DEFAULT_NOTIFICATION_PREFERENCES,
	NotificationLocale,
	NotificationPreferences,
	readNotificationPreferencesCache,
	writeNotificationPreferencesCache,
} from '../../../../auth/notificationPreferencesCache';
import { useNotificationPreferences } from '../../../../hooks/useNotificationPreferences';
import { isNetworkFetchError } from '../../../../utils/oauthErrors';

const showSettingsError = async (err: unknown, networkMessage: string) => {
	if (isNetworkFetchError(err)) {
		await sweetErrorHandling({ message: networkMessage });
		return;
	}
	await sweetErrorHandling(err);
};

type TopicKey =
	| 'bookingUpdates'
	| 'messages'
	| 'payments'
	| 'reviews'
	| 'followAlerts'
	| 'emailDigest'
	| 'marketing';

const TOPIC_KEYS: TopicKey[] = [
	'bookingUpdates',
	'messages',
	'payments',
	'reviews',
	'followAlerts',
	'emailDigest',
	'marketing',
];

function topicEqual(
	a: Pick<NotificationPreferences, TopicKey>,
	b: Pick<NotificationPreferences, TopicKey>,
): boolean {
	return TOPIC_KEYS.every((key) => a[key] === b[key]);
}

function statusLabelKey(status: string | undefined): string {
	switch (status) {
		case 'LINKED':
			return 'linked';
		case 'PENDING':
			return 'pending';
		case 'UNLINKED':
			return 'unlinked';
		default:
			return 'notConnected';
	}
}

function pickTopics(source: NotificationPreferences): Pick<NotificationPreferences, TopicKey> {
	return {
		bookingUpdates: source.bookingUpdates,
		messages: source.messages,
		payments: source.payments,
		reviews: source.reviews,
		followAlerts: source.followAlerts,
		emailDigest: source.emailDigest,
		marketing: source.marketing,
	};
}

const NotificationsSettingsSection: React.FC = () => {
	const { t } = useTranslation('technician');
	const user = useReactiveVar(userVar);
	const userId = user?._id ?? '';

	const {
		preferences,
		loading,
		saving,
		linking,
		disconnecting,
		polling,
		error,
		savePreferences,
		connectTelegram,
		disconnectTelegram,
	} = useNotificationPreferences();

	const [topics, setTopics] = useState<Pick<NotificationPreferences, TopicKey>>({
		bookingUpdates: true,
		messages: true,
		payments: true,
		reviews: true,
		followAlerts: true,
		emailDigest: false,
		marketing: false,
	});
	const [savedTopics, setSavedTopics] = useState(topics);
	const [usingLocalFallback, setUsingLocalFallback] = useState(false);

	const dirty = useMemo(() => !topicEqual(topics, savedTopics), [topics, savedTopics]);

	// Prefer stable remote identity — do NOT depend on a freshly mapped object each render
	// or topic toggles reset on every click.
	useEffect(() => {
		if (preferences) {
			const next = pickTopics(preferences);
			setTopics(next);
			setSavedTopics(next);
			setUsingLocalFallback(false);
			return;
		}

		if (!loading && error && userId) {
			const cached = readNotificationPreferencesCache(userId);
			if (cached) {
				const next = pickTopics(cached);
				setTopics(next);
				setSavedTopics(next);
				setUsingLocalFallback(true);
			}
		}
	}, [
		loading,
		error,
		userId,
		preferences?.bookingUpdates,
		preferences?.messages,
		preferences?.payments,
		preferences?.reviews,
		preferences?.followAlerts,
		preferences?.emailDigest,
		preferences?.marketing,
		preferences?.telegramStatus,
		preferences?.connectedEmail,
		preferences?.notificationLanguage,
		preferences?.emailEnabled,
		preferences?.telegramEnabled,
	]);

	const telegramStatus = preferences?.telegramStatus ?? 'NOT_CONNECTED';
	const canEnableTelegram = telegramStatus === 'LINKED';
	const connectedEmail = preferences?.connectedEmail || user?.userEmail || '';
	const inAppOn = preferences?.inAppEnabled !== false;

	const networkMsg = t('settings.notifications.telegram.networkError');
	const router = useRouter();
	const autoConnectTried = useRef(false);

	const handleLanguage = async (language: NotificationLocale) => {
		try {
			await savePreferences({ notificationLanguage: language });
			await sweetTopSmallSuccessAlert(t('settings.notifications.saved'), 1000);
		} catch (err) {
			await showSettingsError(err, networkMsg);
		}
	};

	const handleChannelToggle = async (key: 'emailEnabled' | 'telegramEnabled', checked: boolean) => {
		try {
			await savePreferences({ [key]: checked });
			await sweetTopSmallSuccessAlert(t('settings.notifications.saved'), 1000);
		} catch (err) {
			await showSettingsError(err, networkMsg);
		}
	};

	const handleConnect = async () => {
		try {
			const url = await connectTelegram();
			if (!url) {
				await sweetErrorHandling(new Error(t('settings.notifications.telegram.linkFailed')));
			}
		} catch (err) {
			await showSettingsError(err, networkMsg);
		}
	};

	// Login / signup CTA: ?connectTelegram=1 → start bot link once
	useEffect(() => {
		if (autoConnectTried.current) return;
		if (!router.isReady) return;
		const flag = router.query.connectTelegram;
		const wants = flag === '1' || flag === 'true';
		if (!wants) return;
		if (loading || !preferences) return;
		if (preferences.telegramStatus === 'LINKED') return;
		autoConnectTried.current = true;
		void handleConnect().finally(() => {
			const { connectTelegram: _drop, ...rest } = router.query;
			void router.replace({ pathname: router.pathname, query: rest }, undefined, { shallow: true });
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps -- run once when prefs ready
	}, [router.isReady, router.query.connectTelegram, loading, preferences?.telegramStatus]);

	const handleDisconnect = async () => {
		try {
			await disconnectTelegram();
			await sweetTopSmallSuccessAlert(t('settings.notifications.telegram.disconnected'), 1200);
		} catch (err) {
			await showSettingsError(err, networkMsg);
		}
	};

	const handleSaveTopics = async () => {
		try {
			await savePreferences({ ...topics });
			setSavedTopics(topics);
			setUsingLocalFallback(false);
			if (userId) {
				writeNotificationPreferencesCache(userId, {
					...(preferences ?? DEFAULT_NOTIFICATION_PREFERENCES),
					...topics,
				});
			}
			await sweetTopSmallSuccessAlert(t('settings.notifications.saved'), 1200);
		} catch (err) {
			if (userId) {
				writeNotificationPreferencesCache(userId, {
					...(preferences ?? DEFAULT_NOTIFICATION_PREFERENCES),
					...topics,
				});
				setSavedTopics(topics);
				setUsingLocalFallback(true);
				await sweetTopSmallSuccessAlert(t('settings.notifications.savedOffline'), 1600);
				return;
			}
			await showSettingsError(err, networkMsg);
		}
	};

	const language = preferences?.notificationLanguage ?? 'ko';

	return (
		<div className="fts-section">
			<SettingsSectionHead title={t('settings.notifications.title')} desc={t('settings.notifications.desc')} />

			{usingLocalFallback && (
				<div className="fts-offline-banner" role="status">
					{t('settings.notifications.offlineBanner')}
				</div>
			)}

			{error && !preferences && !usingLocalFallback && (
				<div className="fts-offline-banner" role="alert">
					{error.message || t('settings.notifications.loadError')}
				</div>
			)}

			{loading && !preferences && !usingLocalFallback ? (
				<p className="fts-hint">{t('settings.loading')}</p>
			) : (
				<>
					<div className="fts-card">
						<h3 className="fts-card__subtitle">{t('settings.notifications.languageTitle')}</h3>
						<p className="fts-hint fts-hint--tight">{t('settings.notifications.languageHint')}</p>
						<SettingsField label={t('settings.notifications.language')}>
							<select
								className="fts-select"
								value={language}
								disabled={saving}
								onChange={(e) => void handleLanguage(e.target.value as NotificationLocale)}
							>
								<option value="ko">한국어 (KO)</option>
								<option value="en">English (EN)</option>
							</select>
						</SettingsField>
					</div>

					<div className="fts-card">
						<h3 className="fts-card__subtitle">{t('settings.notifications.channelsTitle')}</h3>
						<div className="fts-toggle-row">
							<div>
								<div className="fts-toggle-row__label">{t('settings.notifications.channels.inApp')}</div>
								<div className="fts-toggle-row__hint">{t('settings.notifications.channels.inAppHint')}</div>
							</div>
							<SettingsToggle
								on={inAppOn}
								onChange={() => undefined}
								ariaLabel={t('settings.notifications.channels.inApp')}
								disabled
							/>
						</div>
						<div className="fts-toggle-row">
							<div>
								<div className="fts-toggle-row__label">
									{connectedEmail
										? t('settings.notifications.channels.emailWithAddress', {
												email: connectedEmail,
										  })
										: t('settings.notifications.channels.email')}
								</div>
								<div className="fts-toggle-row__hint">
									{connectedEmail
										? t('settings.notifications.channels.emailHint')
										: t('settings.notifications.channels.emailUnavailable')}
								</div>
							</div>
							<SettingsToggle
								on={Boolean(preferences?.emailEnabled)}
								disabled={!connectedEmail || saving}
								onChange={() =>
									void handleChannelToggle('emailEnabled', !preferences?.emailEnabled)
								}
								ariaLabel={t('settings.notifications.channels.email')}
							/>
						</div>
						<div className="fts-toggle-row">
							<div>
								<div className="fts-toggle-row__label">{t('settings.notifications.channels.telegram')}</div>
								<div className="fts-toggle-row__hint">
									{canEnableTelegram
										? t('settings.notifications.channels.telegramHint')
										: t('settings.notifications.channels.telegramConnectFirst')}
								</div>
							</div>
							<SettingsToggle
								on={Boolean(preferences?.telegramEnabled)}
								disabled={!canEnableTelegram || saving}
								onChange={() =>
									void handleChannelToggle('telegramEnabled', !preferences?.telegramEnabled)
								}
								ariaLabel={t('settings.notifications.channels.telegram')}
							/>
						</div>
					</div>

					<div className="fts-card">
						<h3 className="fts-card__subtitle">{t('settings.notifications.telegram.title')}</h3>
						<p className="fts-hint fts-hint--tight">
							{t(`settings.notifications.telegram.status.${statusLabelKey(telegramStatus)}`)}
							{preferences?.telegramUsername
								? ` · @${preferences.telegramUsername.replace(/^@/, '')}`
								: ''}
						</p>
						{polling && (
							<div className="fts-offline-banner fts-telegram-wait" role="status">
								{t('settings.notifications.telegram.waiting')}
							</div>
						)}
						<div className="fts-telegram-actions">
							{telegramStatus !== 'LINKED' && (
								<button
									type="button"
									className="fts-save-btn"
									disabled={linking}
									onClick={() => void handleConnect()}
								>
									{linking
										? t('settings.notifications.telegram.connecting')
										: t('settings.notifications.telegram.connect')}
								</button>
							)}
							{telegramStatus === 'LINKED' && (
								<button
									type="button"
									className="fts-save-btn fts-save-btn--ghost"
									disabled={disconnecting}
									onClick={() => void handleDisconnect()}
								>
									{disconnecting
										? t('settings.notifications.telegram.disconnecting')
										: t('settings.notifications.telegram.disconnect')}
								</button>
							)}
						</div>
					</div>

					<div className="fts-card">
						<h3 className="fts-card__subtitle">{t('settings.notifications.eventsTitle')}</h3>
						{TOPIC_KEYS.map((key) => (
							<div key={key} className="fts-toggle-row">
								<div>
									<div className="fts-toggle-row__label">
										{t(`settings.notifications.prefs.${key}`)}
									</div>
									<div className="fts-toggle-row__hint">
										{t(`settings.notifications.prefs.${key}Hint`)}
									</div>
								</div>
								<SettingsToggle
									on={topics[key]}
									onChange={() => setTopics((prev) => ({ ...prev, [key]: !prev[key] }))}
									ariaLabel={t(`settings.notifications.prefs.${key}`)}
								/>
							</div>
						))}
						<SettingsSaveButton
							onClick={handleSaveTopics}
							loading={saving}
							disabled={!dirty}
							label={t('settings.saveChanges')}
						/>
					</div>
				</>
			)}
		</div>
	);
};

export default NotificationsSettingsSection;
