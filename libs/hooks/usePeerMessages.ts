import { useCallback, useEffect, useMemo, useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { GET_MESSAGES } from '../../apollo/user/message';
import { Conversation, Message } from '../types/fixora/fixora';

const sortMessages = (list: Message[]) =>
	[...list].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

export default function usePeerMessages(
	peerId: string | null | undefined,
	rawConversations: Conversation[],
	pollIntervalMs: number,
) {
	const apolloClient = useApolloClient();
	const [messages, setMessages] = useState<Message[]>([]);
	const [loading, setLoading] = useState(false);

	const bookingIds = useMemo(() => {
		if (!peerId) return [];
		return [
			...new Set(
				rawConversations
					.filter((c) => c.peerId === peerId && c.bookingId)
					.map((c) => c.bookingId as string),
			),
		];
	}, [rawConversations, peerId]);

	const fetchMessages = useCallback(async () => {
		if (!peerId) {
			setMessages([]);
			return;
		}

		setLoading(true);
		try {
			const searches: Array<{ peerId: string; bookingId?: string }> = [{ peerId }];
			bookingIds.forEach((bookingId) => searches.push({ peerId, bookingId }));

			const results = await Promise.all(
				searches.map((search) =>
					apolloClient
						.query<{ getMessages: { list: Message[] } }>({
							query: GET_MESSAGES,
							variables: {
								input: {
									page: 1,
									limit: 100,
									sort: 'createdAt',
									direction: 'ASC',
									search,
								},
							},
							fetchPolicy: 'network-only',
						})
						.catch(() => null),
				),
			);

			const merged = new Map<string, Message>();
			results.forEach((res) => {
				(res?.data?.getMessages?.list ?? []).forEach((message) => merged.set(message._id, message));
			});
			setMessages(sortMessages(Array.from(merged.values())));
		} finally {
			setLoading(false);
		}
	}, [apolloClient, peerId, bookingIds]);

	useEffect(() => {
		fetchMessages();
		if (!peerId || pollIntervalMs <= 0) return undefined;
		const timer = setInterval(fetchMessages, pollIntervalMs);
		return () => clearInterval(timer);
	}, [fetchMessages, peerId, pollIntervalMs]);

	return { messages, loading, refetchMessages: fetchMessages };
}
