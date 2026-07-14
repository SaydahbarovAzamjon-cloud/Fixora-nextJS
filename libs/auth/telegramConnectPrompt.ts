import { initializeApollo } from '../../apollo/client';
import { GET_NOTIFICATION_PREFERENCES } from '../../apollo/user/settings';
import { isTechnicianUser } from '../utils/userRole';
import { ownerMyPageHref } from '../utils/clientMyPageRoute';
import { resolveAuthUser } from '../utils/authSession';
import { toUserFacingErrorMessage } from '../utils/oauthErrors';

export type TelegramConnectOfferResult = 'opened' | 'skipped' | 'already' | 'error';

/**
 * After login: if Telegram is not LINKED, ask once whether to open Connect flow.
 * Returns `opened` when the user accepts — caller should navigate to Settings
 * (`telegramNotificationsSettingsHref({ autoConnect: true })`) so Connect runs
 * with waiting UI (and a clear Connect button if auto-open is blocked).
 */
export async function offerTelegramConnectAfterLogin(options: {
	title: string;
	text: string;
	confirmText: string;
	cancelText: string;
	confirmFn: (opts: {
		title: string;
		text: string;
		confirmButtonText: string;
		cancelButtonText: string;
	}) => Promise<boolean>;
}): Promise<TelegramConnectOfferResult> {
	try {
		const apollo = await initializeApollo();
		const prefsResult = await apollo.query({
			query: GET_NOTIFICATION_PREFERENCES,
			fetchPolicy: 'network-only',
			errorPolicy: 'ignore',
		});
		const status = prefsResult.data?.getNotificationPreferences?.telegramStatus as
			| string
			| undefined;
		if (status === 'LINKED') {
			return 'already';
		}

		const accepted = await options.confirmFn({
			title: options.title,
			text: options.text,
			confirmButtonText: options.confirmText,
			cancelButtonText: options.cancelText,
		});
		if (!accepted) return 'skipped';
		return 'opened';
	} catch (err) {
		console.warn('[telegramConnect]', toUserFacingErrorMessage(err));
		return 'error';
	}
}

export function telegramNotificationsSettingsHref(
	user = resolveAuthUser(),
	opts?: { autoConnect?: boolean },
): string {
	const base = isTechnicianUser(user)
		? '/technician/settings?section=notifications'
		: ownerMyPageHref('settings', 'notifications');
	if (!opts?.autoConnect) return base;
	const join = base.includes('?') ? '&' : '?';
	return `${base}${join}connectTelegram=1`;
}
