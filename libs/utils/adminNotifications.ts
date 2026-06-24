import type { Notification } from '../types/fixora/fixora';

/** Admin bell — resolve target route from API notification fields only. */
export function getAdminNotificationLink(notification: Notification): string | null {
	const referenceId = notification.referenceId?.trim();
	const actorId = notification.userId?.trim();

	switch (notification.referenceType) {
		case 'BOOKING':
			if (referenceId) return `/_admin/bookings?bookingId=${encodeURIComponent(referenceId)}`;
			if (actorId) return `/_admin/bookings?userId=${encodeURIComponent(actorId)}`;
			return '/_admin/bookings';
		case 'USER':
			if (referenceId) return `/_admin/users/${encodeURIComponent(referenceId)}`;
			if (actorId) return `/_admin/users/${encodeURIComponent(actorId)}`;
			return '/_admin/users';
		case 'MESSAGE':
			if (referenceId) return `/messages?peerId=${encodeURIComponent(referenceId)}`;
			if (actorId) return `/messages?peerId=${encodeURIComponent(actorId)}`;
			return '/messages';
		case 'PAYMENT':
			if (referenceId) return `/_admin/payments?paymentId=${encodeURIComponent(referenceId)}`;
			if (actorId) return `/_admin/payments?userId=${encodeURIComponent(actorId)}`;
			return '/_admin/payments';
		case 'REVIEW':
			if (referenceId) return `/_admin/users/${encodeURIComponent(referenceId)}`;
			if (actorId) return `/_admin/users/${encodeURIComponent(actorId)}`;
			return '/_admin/users';
		case 'ARTICLE':
			if (referenceId) return `/_admin/moderation?articleId=${encodeURIComponent(referenceId)}`;
			return '/_admin/moderation';
		default:
			break;
	}

	switch (notification.notificationType) {
		case 'BOOKING':
			return actorId ? `/_admin/bookings?userId=${encodeURIComponent(actorId)}` : '/_admin/bookings';
		case 'PAYMENT':
			return actorId ? `/_admin/payments?userId=${encodeURIComponent(actorId)}` : '/_admin/payments';
		case 'MESSAGE':
			return '/messages';
		default:
			return actorId ? `/_admin/users/${encodeURIComponent(actorId)}` : null;
	}
}

export function getAdminNotificationDisplayText(notification: Notification): string {
	return notification.notificationTitle?.trim() || notification.notificationDescription?.trim() || '';
}
