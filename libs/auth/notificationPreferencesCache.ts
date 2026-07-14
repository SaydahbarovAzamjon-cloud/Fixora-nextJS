/** Topic + channel prefs — synced with FixoraB NotificationPreferences */

export type NotificationLocale = 'ko' | 'en';

export type TelegramLinkStatus = 'NOT_CONNECTED' | 'PENDING' | 'LINKED' | 'UNLINKED';

export type NotificationEmailSource = 'EMAIL' | 'GOOGLE' | 'KAKAO' | 'APPLE';

export type NotificationPreferences = {
	bookingUpdates: boolean;
	messages: boolean;
	payments: boolean;
	reviews: boolean;
	marketing: boolean;
	followAlerts: boolean;
	emailDigest: boolean;
	notificationLanguage: NotificationLocale;
	emailEnabled: boolean;
	inAppEnabled: boolean;
	telegramEnabled: boolean;
	smsEnabled: boolean;
	pushEnabled: boolean;
	connectedEmail?: string;
	emailSource?: NotificationEmailSource;
	telegramStatus?: TelegramLinkStatus;
	telegramUsername?: string;
};

export type NotificationPreferencesInput = {
	bookingUpdates?: boolean;
	messages?: boolean;
	payments?: boolean;
	reviews?: boolean;
	marketing?: boolean;
	followAlerts?: boolean;
	emailDigest?: boolean;
	notificationLanguage?: NotificationLocale;
	emailEnabled?: boolean;
	telegramEnabled?: boolean;
	smsEnabled?: boolean;
	pushEnabled?: boolean;
};

/** Soft signup / OAuth — intent only until bot link */
export type NotificationSetupInput = {
	emailEnabled?: boolean;
	telegramEnabled?: boolean;
	telegramUsername?: string;
	notificationLanguage?: NotificationLocale;
};

const CACHE_PREFIX = 'fixora_notification_prefs:';

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
	bookingUpdates: true,
	messages: true,
	payments: true,
	reviews: true,
	marketing: false,
	followAlerts: true,
	emailDigest: false,
	notificationLanguage: 'en',
	emailEnabled: true,
	inAppEnabled: true,
	telegramEnabled: false,
	smsEnabled: false,
	pushEnabled: false,
};

export const DEFAULT_NOTIFICATION_SETUP: NotificationSetupInput = {
	emailEnabled: true,
	telegramEnabled: false,
	telegramUsername: '',
	notificationLanguage: 'en',
};

export function normalizeTelegramUsername(raw: string): string {
	const trimmed = raw.trim().replace(/^@+/, '');
	return trimmed;
}

/** Telegram username format only — length 5–32, [a-zA-Z0-9_]. Empty is valid (optional). */
export function isValidTelegramUsernameFormat(raw: string): boolean {
	const name = normalizeTelegramUsername(raw);
	if (!name) return true;
	return /^[a-zA-Z0-9_]{5,32}$/.test(name);
}

export function readNotificationPreferencesCache(userId: string): NotificationPreferences | null {
	if (typeof window === 'undefined' || !userId) return null;
	try {
		const raw = localStorage.getItem(`${CACHE_PREFIX}${userId}`);
		if (!raw) return null;
		return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...JSON.parse(raw) };
	} catch {
		return null;
	}
}

export function writeNotificationPreferencesCache(
	userId: string,
	prefs: NotificationPreferences,
): void {
	if (typeof window === 'undefined' || !userId) return;
	localStorage.setItem(`${CACHE_PREFIX}${userId}`, JSON.stringify(prefs));
}
