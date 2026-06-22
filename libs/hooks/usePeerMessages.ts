import { useCallback, useEffect, useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { GET_MESSAGES } from '../../apollo/user/message';
import { Message } from '../types/fixora/fixora';

const sortMessages = (list: Message[]) =>
	[...list].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

export default function usePeerMessages(peerId: string | null | undefined, pollIntervalMs: number) {
	const apolloClient = useApolloClient();
	const [messages, setMessages] = useState<Message[]>([]);
	const [loading, setLoading] = useState(false);

	const fetchMessages = useCallback(async () => {
		if (!peerId) {
			setMessages([]);
			return;
		}

		setLoading(true);
		try {
			const res = await apolloClient.query<{ getMessages: { list: Message[] } }>({
				query: GET_MESSAGES,
				variables: {
					input: {
						page: 1,
						limit: 100,
						sort: 'createdAt',
						direction: 'ASC',
						search: { peerId },
					},
				},
				fetchPolicy: 'network-only',
			});
			setMessages(sortMessages(res?.data?.getMessages?.list ?? []));
		} catch {
			setMessages([]);
		} finally {
			setLoading(false);
		}
	}, [apolloClient, peerId]);

	useEffect(() => {
		fetchMessages();
		if (!peerId || pollIntervalMs <= 0) return undefined;
		const timer = setInterval(fetchMessages, pollIntervalMs);
		return () => clearInterval(timer);
	}, [fetchMessages, peerId, pollIntervalMs]);

	return { messages, loading, refetchMessages: fetchMessages };
}
