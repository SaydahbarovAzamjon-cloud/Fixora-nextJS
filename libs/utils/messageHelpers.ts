import { bookingRefId } from '../components/mypage/fixora/myPageHelpers';
import { Booking, Conversation, Message } from '../types/fixora/fixora';

export { bookingRefId };

const ACTIVE_BOOKING_STATUSES: Booking['bookingStatus'][] = [
	'PENDING',
	'ACCEPTED',
	'IN_PROGRESS',
	'COMPLETED',
];

const mergePeerConversations = (list: Conversation[]): Conversation => {
	const sorted = [...list].sort(
		(a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime(),
	);
	const newest = sorted[0];
	const bookingId = resolvePeerBookingId(newest.peerId, list);
	const bookingSource = sorted.find((conv) => conv.bookingId === bookingId) ?? newest;

	return {
		...newest,
		bookingId,
		bookingStatus: bookingSource.bookingStatus ?? newest.bookingStatus ?? null,
		unreadCount: list.reduce((sum, conv) => sum + (conv.unreadCount ?? 0), 0),
	};
};

export const dedupeConversationsByPeer = (conversations: Conversation[]): Conversation[] => {
	const grouped = new Map<string, Conversation[]>();
	conversations.forEach((conv) => {
		const list = grouped.get(conv.peerId) ?? [];
		list.push(conv);
		grouped.set(conv.peerId, list);
	});

	return Array.from(grouped.values())
		.map((list) => mergePeerConversations(list))
		.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
};

/** Resolve the best booking id for a peer from raw or deduped conversation rows. */
export const resolvePeerBookingId = (
	peerId: string | null | undefined,
	conversations: Conversation[],
	preferredBookingId?: string | null,
): string | null => {
	if (!peerId) return null;
	if (preferredBookingId) return preferredBookingId;

	const peerConversations = conversations.filter((conv) => conv.peerId === peerId);
	const candidates = new Map<string, string>();

	peerConversations.forEach((conv) => {
		if (conv.bookingId) {
			candidates.set(conv.bookingId, conv.updatedAt || conv.lastMessage?.createdAt || '');
		}
		if (conv.lastMessage?.bookingId) {
			candidates.set(
				conv.lastMessage.bookingId,
				conv.lastMessage.createdAt || conv.updatedAt || '',
			);
		}
	});

	if (candidates.size === 0) return null;

	return [...candidates.entries()].sort(
		(a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime(),
	)[0][0];
};

export const resolveBookingForPeer = (
	peerId: string | null | undefined,
	conversations: Conversation[],
	bookings: Booking[],
	preferredBookingId?: string | null,
): Booking | null => {
	const bookingId = resolvePeerBookingId(peerId, conversations, preferredBookingId);
	if (bookingId) {
		return bookings.find((booking) => booking._id === bookingId) ?? null;
	}

	if (!peerId) return null;

	const technicianBookings = bookings
		.filter((booking) => booking.technicianId === peerId)
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

	return (
		technicianBookings.find((booking) => ACTIVE_BOOKING_STATUSES.includes(booking.bookingStatus)) ??
		technicianBookings[0] ??
		null
	);
};

export const formatMessagePreview = (
	message: Message | undefined | null,
	t: (key: string) => string,
): string => {
	if (!message) return '';
	if (message.messageType === 'IMAGE') return t('messages.previewPhoto');
	return message.messageContent;
};

export const formatConversationTime = (dateStr?: string | null): string => {
	if (!dateStr) return '';
	const date = new Date(dateStr);
	const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
	if (minutes < 1) return 'now';
	if (minutes < 60) return `${minutes}m`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h`;
	const days = Math.floor(hours / 24);
	if (days < 7) return `${days}d`;
	return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const peerDisplayName = (conv?: Conversation | null): string =>
	conv?.peer?.shopName || conv?.peer?.userFullName || conv?.peer?.userNickname || '';
