export type NotificationPreferences = {
	bookingUpdates: boolean;
	messages: boolean;
	payments: boolean;
	reviews: boolean;
	marketing: boolean;
	followAlerts: boolean;
	emailDigest: boolean;
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
};

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
