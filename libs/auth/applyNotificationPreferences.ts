import type { ApolloClient } from '@apollo/client';
import { UPDATE_NOTIFICATION_PREFERENCES } from '../../apollo/user/settings';
import {
	NotificationPreferences,
	NotificationPreferencesInput,
	writeNotificationPreferencesCache,
} from './notificationPreferencesCache';

/** Apply topic prefs after signup when notificationSetup alone is not enough. */
export async function applyNotificationPreferences(
	apolloClient: ApolloClient<unknown>,
	userId: string,
	prefs: Pick<
		NotificationPreferences,
		| 'bookingUpdates'
		| 'messages'
		| 'payments'
		| 'reviews'
		| 'marketing'
		| 'followAlerts'
		| 'emailDigest'
	> &
		Partial<NotificationPreferencesInput>,
): Promise<void> {
	const input: NotificationPreferencesInput = {
		bookingUpdates: prefs.bookingUpdates,
		messages: prefs.messages,
		payments: prefs.payments,
		reviews: prefs.reviews,
		marketing: prefs.marketing,
		followAlerts: prefs.followAlerts,
		emailDigest: prefs.emailDigest,
		...(prefs.notificationLanguage != null
			? { notificationLanguage: prefs.notificationLanguage }
			: {}),
		...(prefs.emailEnabled != null ? { emailEnabled: prefs.emailEnabled } : {}),
		...(prefs.telegramEnabled != null ? { telegramEnabled: prefs.telegramEnabled } : {}),
	};
	try {
		await apolloClient.mutate({
			mutation: UPDATE_NOTIFICATION_PREFERENCES,
			variables: { input },
		});
	} finally {
		writeNotificationPreferencesCache(userId, {
			bookingUpdates: prefs.bookingUpdates ?? true,
			messages: prefs.messages ?? true,
			payments: prefs.payments ?? true,
			reviews: prefs.reviews ?? true,
			marketing: prefs.marketing ?? false,
			followAlerts: prefs.followAlerts ?? true,
			emailDigest: prefs.emailDigest ?? false,
			notificationLanguage: prefs.notificationLanguage ?? 'ko',
			emailEnabled: prefs.emailEnabled ?? true,
			inAppEnabled: true,
			telegramEnabled: prefs.telegramEnabled ?? false,
			smsEnabled: false,
			pushEnabled: false,
		});
	}
}
