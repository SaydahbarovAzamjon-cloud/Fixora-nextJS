import React, { useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';
import ConversationList from '../../../libs/components/technician/ConversationList';
import MessageThread from '../../../libs/components/technician/MessageThread';
import {
	GET_MY_CONVERSATIONS,
	GET_MESSAGES,
	SEND_MESSAGE,
	MARK_MESSAGES_AS_READ,
} from '../../../apollo/user/message';
import { GET_BOOKING } from '../../../apollo/user/query';
import { userVar } from '../../../apollo/store';
import { Conversation, Message } from '../../../libs/types/fixora/fixora';
import { sweetErrorHandling } from '../../../libs/sweetAlert';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	},
});

interface LocalConversation {
	id: string;
	customerName: string;
	customerImage?: string;
	lastMessage: string;
	timestamp: string;
	isUnread: boolean;
	bookingId?: string;
	status?: string;
}

interface LocalMessage {
	id: string;
	senderType: 'technician' | 'customer';
	content: string;
	timestamp: string;
}

const Messages: NextPage = () => {
	const user = useReactiveVar(userVar);
	const [selected, setSelected] = useState<{ peerId: string; bookingId?: string | null } | null>(null);

	const { data: conversationsData, refetch: refetchConversations } = useQuery(GET_MY_CONVERSATIONS, {
		skip: !user?._id,
		variables: { input: { page: 1, limit: 50 } },
		fetchPolicy: 'network-only',
	});

	const rawConversations: Conversation[] = conversationsData?.getMyConversations?.list ?? [];

	useEffect(() => {
		if (!selected && rawConversations.length > 0) {
			setSelected({
				peerId: rawConversations[0].peerId,
				bookingId: rawConversations[0].bookingId ?? null,
			});
		}
	}, [rawConversations, selected]);

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

	const rawMessages: Message[] = messagesData?.getMessages?.list ?? [];

	const { data: bookingData } = useQuery(GET_BOOKING, {
		skip: !selected?.bookingId,
		variables: { bookingId: selected?.bookingId },
		fetchPolicy: 'network-only',
	});

	const booking = bookingData?.getBooking ?? null;

	const [sendMessage] = useMutation(SEND_MESSAGE);
	const [markMessagesAsRead] = useMutation(MARK_MESSAGES_AS_READ);

	// Map real data to local interfaces
	const conversations: LocalConversation[] = useMemo(() => {
		return rawConversations.map((c) => ({
			id: c.peerId,
			customerName: c.peer?.userFullName || c.peer?.userNickname || 'Customer',
			customerImage: c.peer?.userProfileImage,
			lastMessage: c.lastMessage?.messageContent ?? '',
			timestamp: new Date(c.updatedAt).toLocaleString('en-US', {
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			}),
			isUnread: c.unreadCount > 0,
			bookingId: c.bookingId ?? undefined,
			status:
				c.bookingStatus === 'COMPLETED' ? 'completed' : c.bookingId ? 'in-progress' : undefined,
		}));
	}, [rawConversations]);

	const messages: LocalMessage[] = useMemo(() => {
		return rawMessages.map((m) => ({
			id: m._id,
			senderType: m.senderId === user?._id ? 'technician' : 'customer',
			content: m.messageContent,
			timestamp: new Date(m.createdAt).toLocaleTimeString('en-US', {
				hour: '2-digit',
				minute: '2-digit',
			}),
		}));
	}, [rawMessages, user?._id]);

	const selectedConversation = conversations.find((c) => c.id === selected?.peerId);

	const selectConversation = (conversationId: string) => {
		const conv = conversations.find((c) => c.id === conversationId);
		if (conv) {
			setSelected({ peerId: conversationId, bookingId: conv.bookingId ?? null });
			if (conv.isUnread) {
				markMessagesAsRead({
					variables: { input: { peerId: conversationId, bookingId: conv.bookingId || undefined } },
				})
					.then(() => refetchConversations())
					.catch(() => undefined);
			}
		}
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

	return (
		<div className="fixora-technician-messages-page">
			<div className="fixora-messages-container">
				{/* Left Pane - Conversations */}
				<div className="fixora-messages-left">
					<ConversationList
						conversations={conversations}
						selectedId={selected?.peerId}
						onSelectConversation={selectConversation}
					/>
				</div>

				{/* Right Pane - Message Thread */}
				<div className="fixora-messages-right">
					<MessageThread
						conversationId={selected?.peerId}
						customerName={selectedConversation?.customerName}
						messages={messages}
						bookingStatus={booking?.bookingStatus ?? selectedConversation?.status}
						requestPrice={booking?.finalPrice ?? booking?.estimatedPrice}
						startDate={booking?.createdAt}
						onSendMessage={sendHandler}
					/>
				</div>
			</div>
		</div>
	);
};

export default withTechnicianLayout(Messages);
