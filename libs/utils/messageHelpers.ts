import { bookingRefId } from '../components/mypage/fixora/myPageHelpers';
import { Conversation, Message } from '../types/fixora/fixora';

export { bookingRefId };

export const dedupeConversationsByPeer = (conversations: Conversation[]): Conversation[] => {
	const grouped = new Map<string, Conversation>();
	conversations.forEach((conv) => {
		const existing = grouped.get(conv.peerId);
		if (!existing) {
			grouped.set(conv.peerId, { ...conv });
			return;
		}
		const existingTime = new Date(existing.updatedAt || 0).getTime();
		const currentTime = new Date(conv.updatedAt || 0).getTime();
		const newest = currentTime > existingTime ? conv : existing;
		grouped.set(conv.peerId, {
			...newest,
			unreadCount: (existing.unreadCount ?? 0) + (conv.unreadCount ?? 0),
		});
	});
	return Array.from(grouped.values()).sort(
		(a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime(),
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
