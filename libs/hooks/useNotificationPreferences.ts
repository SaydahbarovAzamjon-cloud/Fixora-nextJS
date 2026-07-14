import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import {
	DISCONNECT_TELEGRAM,
	GET_NOTIFICATION_PREFERENCES,
	REQUEST_TELEGRAM_LINK,
	UPDATE_NOTIFICATION_PREFERENCES,
} from '../../apollo/user/settings';
import {
	NotificationPreferences,
	NotificationPreferencesInput,
	writeNotificationPreferencesCache,
} from '../auth/notificationPreferencesCache';
import { userVar } from '../../apollo/store';

const POLL_MS = 4000;

function mapPrefs(remote: Record<string, unknown> | null | undefined): NotificationPreferences | undefined {
	if (!remote) return undefined;
	return {
		bookingUpdates: Boolean(remote.bookingUpdates ?? true),
		messages: Boolean(remote.messages ?? true),
		payments: Boolean(remote.payments ?? true),
		reviews: Boolean(remote.reviews ?? true),
		marketing: Boolean(remote.marketing ?? false),
		followAlerts: Boolean(remote.followAlerts ?? true),
		emailDigest: Boolean(remote.emailDigest ?? false),
		notificationLanguage: (remote.notificationLanguage as 'ko' | 'en') || 'ko',
		emailEnabled: Boolean(remote.emailEnabled ?? true),
		inAppEnabled: remote.inAppEnabled !== false,
		telegramEnabled: Boolean(remote.telegramEnabled ?? false),
		smsEnabled: Boolean(remote.smsEnabled ?? false),
		pushEnabled: Boolean(remote.pushEnabled ?? false),
		connectedEmail: (remote.connectedEmail as string | undefined) || undefined,
		emailSource: remote.emailSource as NotificationPreferences['emailSource'],
		telegramStatus: remote.telegramStatus as NotificationPreferences['telegramStatus'],
		telegramUsername: (remote.telegramUsername as string | undefined) || undefined,
	};
}

export function useNotificationPreferences() {
	const user = useReactiveVar(userVar);
	const userId = user?._id ?? '';

	const { data, loading, error, refetch } = useQuery(GET_NOTIFICATION_PREFERENCES, {
		fetchPolicy: 'network-only',
		errorPolicy: 'all',
	});

	const [updatePrefs, { loading: saving }] = useMutation(UPDATE_NOTIFICATION_PREFERENCES);
	const [requestLink, { loading: linking }] = useMutation(REQUEST_TELEGRAM_LINK);
	const [disconnect, { loading: disconnecting }] = useMutation(DISCONNECT_TELEGRAM);

	const [polling, setPolling] = useState(false);
	const linkExpiresAtRef = useRef<number | null>(null);

	const remoteRaw = data?.getNotificationPreferences;
	const preferences = useMemo(() => {
		const mapped = mapPrefs(remoteRaw);
		if (!mapped) return undefined;
		// Fall back to session email when API omits connectedEmail
		if (!mapped.connectedEmail && user?.userEmail) {
			return { ...mapped, connectedEmail: user.userEmail };
		}
		return mapped;
	}, [remoteRaw, user?.userEmail]);

	useEffect(() => {
		if (preferences && userId) {
			writeNotificationPreferencesCache(userId, preferences);
		}
	}, [preferences, userId]);

	useEffect(() => {
		if (!polling) return;
		const id = window.setInterval(() => {
			if (linkExpiresAtRef.current && Date.now() > linkExpiresAtRef.current) {
				setPolling(false);
				linkExpiresAtRef.current = null;
				return;
			}
			void refetch();
		}, POLL_MS);
		return () => window.clearInterval(id);
	}, [polling, refetch]);

	useEffect(() => {
		if (preferences?.telegramStatus === 'LINKED') {
			setPolling(false);
			linkExpiresAtRef.current = null;
		}
	}, [preferences?.telegramStatus]);

	const savePreferences = useCallback(
		async (input: NotificationPreferencesInput) => {
			const result = await updatePrefs({ variables: { input } });
			if (result.errors?.length) {
				throw new Error(result.errors[0]?.message || 'Failed to update preferences');
			}
			await refetch();
			const next = mapPrefs(result.data?.updateNotificationPreferences);
			if (next && userId) writeNotificationPreferencesCache(userId, next);
			return next;
		},
		[updatePrefs, refetch, userId],
	);

	const connectTelegram = useCallback(async () => {
		// Open synchronously in the click handler stack so popup blockers allow it.
		const popup = typeof window !== 'undefined' ? window.open('about:blank', '_blank') : null;

		try {
			const result = await requestLink();
			if (result.errors?.length) {
				popup?.close();
				throw new Error(result.errors[0]?.message || 'Failed to request Telegram link');
			}
			const payload = result.data?.requestTelegramLink as
				| { linkUrl?: string; expiresAt?: string }
				| undefined;
			const linkUrl = payload?.linkUrl;
			if (!linkUrl) {
				popup?.close();
				return undefined;
			}
			if (payload?.expiresAt) {
				linkExpiresAtRef.current = new Date(payload.expiresAt).getTime();
			} else {
				linkExpiresAtRef.current = Date.now() + 10 * 60 * 1000;
			}
			setPolling(true);
			if (popup && !popup.closed) {
				popup.location.href = linkUrl;
			} else {
				window.location.href = linkUrl;
			}
			return linkUrl;
		} catch (err) {
			popup?.close();
			throw err;
		}
	}, [requestLink]);

	const disconnectTelegram = useCallback(async () => {
		setPolling(false);
		linkExpiresAtRef.current = null;
		const result = await disconnect();
		if (result.errors?.length) {
			throw new Error(result.errors[0]?.message || 'Failed to disconnect Telegram');
		}
		await refetch();
	}, [disconnect, refetch]);

	const stopPolling = useCallback(() => {
		setPolling(false);
		linkExpiresAtRef.current = null;
	}, []);

	return {
		preferences,
		loading,
		saving,
		linking,
		disconnecting,
		polling,
		error,
		refetch,
		savePreferences,
		connectTelegram,
		disconnectTelegram,
		stopPolling,
	};
}
