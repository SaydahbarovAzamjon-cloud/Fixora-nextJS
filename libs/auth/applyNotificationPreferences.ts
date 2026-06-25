import type { ApolloClient } from '@apollo/client';
import { UPDATE_NOTIFICATION_PREFERENCES } from '../../apollo/user/settings';
import {
	NotificationPreferences,
	writeNotificationPreferencesCache,
} from './notificationPreferencesCache';

/** Apply signup / OAuth notification toggles (schema has no embedded signup field). */
export async function applyNotificationPreferences(
	apolloClient: ApolloClient<unknown>,
	userId: string,
	prefs: NotificationPreferences,
): Promise<void> {
	const input = {
		bookingUpdates: prefs.bookingUpdates,
		messages: prefs.messages,
		payments: prefs.payments,
		reviews: prefs.reviews,
		marketing: prefs.marketing,
		followAlerts: prefs.followAlerts,
		emailDigest: prefs.emailDigest,
	};
	try {
		await apolloClient.mutate({
			mutation: UPDATE_NOTIFICATION_PREFERENCES,
			variables: { input },
		});
	} finally {
		writeNotificationPreferencesCache(userId, prefs);
	}
}
