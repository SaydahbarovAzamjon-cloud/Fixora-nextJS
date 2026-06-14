import React, { useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import ConversationList from '../../libs/components/messages/ConversationList';
import ChatThread from '../../libs/components/messages/ChatThread';
import RequestDetailsPanel from '../../libs/components/messages/RequestDetailsPanel';
import { GET_MY_CONVERSATIONS, GET_MESSAGES, SEND_MESSAGE, MARK_MESSAGES_AS_READ } from '../../apollo/user/message';
import { GET_USER, GET_BOOKING, GET_DEVICE } from '../../apollo/user/query';
import { userVar } from '../../apollo/store';
import { Conversation, Message } from '../../libs/types/fixora/fixora';
import { sweetErrorHandling } from '../../libs/sweetAlert';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	},
});

const MessagesPage: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const queryPeerId = router.query.peerId as string | undefined;
	const queryBookingId = router.query.bookingId as string | undefined;

	const [selected, setSelected] = useState<{ peerId: string; bookingId?: string | null } | null>(null);

	/** APOLLO REQUESTS **/
	const { data: conversationsData, refetch: refetchConversations } = useQuery(GET_MY_CONVERSATIONS, {
		skip: !user?._id,
		variables: { input: { page: 1, limit: 50 } },
		fetchPolicy: 'network-only',
	});

	const conversations: Conversation[] = conversationsData?.getMyConversations?.list ?? [];

	const { data: peerData } = useQuery(GET_USER, {
		skip: !selected?.peerId || conversations.some((c) => c.peerId === selected?.peerId),
		variables: { userId: selected?.peerId },
		fetchPolicy: 'network-only',
	});

	const { data: messagesData, refetch: refetchMessages } = useQuery(GET_MESSAGES, {
		skip: !selected?.peerId,
		variables: {
			input: {
				page: 1,
				limit: 100,
				sort: 'createdAt',
				direction: 'ASC',
				search: { peerId: selected?.peerId, bookingId: selected?.bookingId || undefined },
			},
		},
		fetchPolicy: 'network-only',
		pollInterval: 5000,
	});

	const messages: Message[] = messagesData?.getMessages?.list ?? [];

	const { data: bookingData, loading: bookingLoading } = useQuery(GET_BOOKING, {
		skip: !selected?.bookingId,
		variables: { bookingId: selected?.bookingId },
		fetchPolicy: 'network-only',
	});

	const booking = bookingData?.getBooking ?? null;

	const { data: deviceData } = useQuery(GET_DEVICE, {
		skip: !booking?.deviceId,
		variables: { deviceId: booking?.deviceId },
		fetchPolicy: 'network-only',
	});

	const device = deviceData?.getDevice ?? null;

	const [sendMessage, { loading: sending }] = useMutation(SEND_MESSAGE);
	const [markMessagesAsRead] = useMutation(MARK_MESSAGES_AS_READ);

	/** LIFECYCLES **/
	useEffect(() => {
		if (!user?._id) {
			router.push('/').then();
		}
	}, [user]);

	useEffect(() => {
		if (queryPeerId) {
			setSelected({ peerId: queryPeerId, bookingId: queryBookingId ?? null });
			return;
		}
		if (!selected && conversations.length > 0) {
			setSelected({ peerId: conversations[0].peerId, bookingId: conversations[0].bookingId ?? null });
		}
	}, [queryPeerId, queryBookingId, conversations, selected]);

	useEffect(() => {
		if (!selected?.peerId || !user?._id) return;
		const conversation = conversations.find((c) => c.peerId === selected.peerId);
		if (conversation && conversation.unreadCount > 0) {
			markMessagesAsRead({
				variables: { input: { peerId: selected.peerId, bookingId: selected.bookingId || undefined } },
			})
				.then(() => refetchConversations())
				.catch(() => undefined);
		}
	}, [selected?.peerId, selected?.bookingId, conversations]);

	/** HANDLERS **/
	const selectConversation = (conversation: Conversation) => {
		setSelected({ peerId: conversation.peerId, bookingId: conversation.bookingId ?? null });
	};

	const sendHandler = async (text: string) => {
		if (!selected?.peerId) return;
		try {
			await sendMessage({
				variables: {
					input: {
						receiverId: selected.peerId,
						bookingId: selected.bookingId || undefined,
						messageContent: text,
						messageType: 'TEXT',
					},
				},
			});
			await refetchMessages();
			await refetchConversations();
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	const activePeer = useMemo(() => {
		const fromConversation = conversations.find((c) => c.peerId === selected?.peerId)?.peer;
		if (fromConversation) return fromConversation;
		return peerData?.getUser ? { ...peerData.getUser } : null;
	}, [conversations, selected?.peerId, peerData]);

	return (
		<div className="fixora-messages-page">
			<div className="container fixora-messages">
				<ConversationList conversations={conversations} selectedPeerId={selected?.peerId} onSelect={selectConversation} />

				<ChatThread peer={activePeer} messages={messages} currentUserId={user?._id} onSend={sendHandler} sending={sending} />

				<RequestDetailsPanel booking={booking} device={device} loading={selected?.bookingId ? bookingLoading : false} />
			</div>
		</div>
	);
};

export default withLayoutFull(MessagesPage);
