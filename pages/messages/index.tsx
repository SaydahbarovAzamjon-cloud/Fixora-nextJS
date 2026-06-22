import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useApolloClient, useMutation, useQuery, useReactiveVar } from '@apollo/client';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import ConversationList from '../../libs/components/messages/ConversationList';
import ChatThread, { SendMessagePayload } from '../../libs/components/messages/ChatThread';
import ChatBookingContextBar from '../../libs/components/messages/ChatBookingContextBar';
import RequestDetailsPanel from '../../libs/components/messages/RequestDetailsPanel';
import { GET_MY_CONVERSATIONS, SEND_MESSAGE, MARK_MESSAGES_AS_READ } from '../../apollo/user/message';
import { GET_USER, GET_BOOKING, GET_DEVICE } from '../../apollo/user/query';
import { userVar } from '../../apollo/store';
import { Booking, Conversation, ConversationPeer } from '../../libs/types/fixora/fixora';
import { sweetErrorHandling } from '../../libs/sweetAlert';
import useRealtimePollInterval from '../../libs/hooks/useRealtimePollInterval';
import usePeerMessages from '../../libs/hooks/usePeerMessages';
import { GET_MY_BOOKINGS } from '../../apollo/user/profile';
import { dedupeConversationsByPeer, resolvePeerBookingId } from '../../libs/utils/messageHelpers';
import { fileToDataUrl } from '../../libs/utils/compressMessageImage';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	},
});

const MessagesPage: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const apolloClient = useApolloClient();

	const queryPeerId = router.query.peerId as string | undefined;
	const queryBookingId = router.query.bookingId as string | undefined;

	const [selected, setSelected] = useState<{ peerId: string; bookingId?: string | null } | null>(null);
	const [bookingMeta, setBookingMeta] = useState<Record<string, Booking>>({});
	const fetchedBookingIds = useRef(new Set<string>());
	const conversationsPollMs = useRealtimePollInterval(30000);
	const messagesPollMs = useRealtimePollInterval(15000);

	/** APOLLO REQUESTS **/
	const { data: conversationsData, refetch: refetchConversations } = useQuery(GET_MY_CONVERSATIONS, {
		skip: !user?._id,
		variables: { input: { page: 1, limit: 50 } },
		fetchPolicy: 'network-only',
		pollInterval: conversationsPollMs,
	});

	const { data: myBookingsData, loading: myBookingsLoading } = useQuery(GET_MY_BOOKINGS, {
		skip: !user?._id,
		variables: {
			input: { page: 1, limit: 50, sort: 'createdAt', direction: 'DESC', search: {} },
		},
		fetchPolicy: 'cache-first',
	});

	const myBookings: Booking[] = myBookingsData?.getMyBookings?.list ?? [];

	const rawConversations: Conversation[] = conversationsData?.getMyConversations?.list ?? [];
	const conversations = useMemo(() => dedupeConversationsByPeer(rawConversations), [rawConversations]);

	const activeConversation = useMemo(
		() => conversations.find((c) => c.peerId === selected?.peerId) ?? null,
		[conversations, selected?.peerId],
	);

	const activeBookingId = useMemo(() => {
		if (!selected?.peerId) return null;

		const fromConversations = resolvePeerBookingId(
			selected.peerId,
			rawConversations,
			selected.bookingId ?? activeConversation?.bookingId,
		);
		if (fromConversations) return fromConversations;

		const technicianBookings = myBookings
			.filter((booking) => booking.technicianId === selected.peerId)
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

		const activeMatch = technicianBookings.find((booking) =>
			['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].includes(booking.bookingStatus),
		);

		return activeMatch?._id ?? technicianBookings[0]?._id ?? null;
	}, [selected, rawConversations, activeConversation?.bookingId, myBookings]);

	const { data: peerData } = useQuery(GET_USER, {
		skip: !selected?.peerId,
		variables: { userId: selected?.peerId },
		fetchPolicy: 'network-only',
	});

	const { messages, refetchMessages } = usePeerMessages(selected?.peerId, rawConversations, messagesPollMs);

	const { data: bookingData, loading: bookingLoading } = useQuery(GET_BOOKING, {
		skip: !activeBookingId,
		variables: { bookingId: activeBookingId },
		fetchPolicy: 'network-only',
	});

	const booking = bookingData?.getBooking ?? null;

	const { data: deviceData } = useQuery(GET_DEVICE, {
		skip: !booking?.deviceId,
		variables: { deviceId: booking?.deviceId },
		fetchPolicy: 'network-only',
	});

	const device = deviceData?.getDevice ?? booking?.deviceData ?? null;

	const [sendMessage, { loading: sending }] = useMutation(SEND_MESSAGE);
	const [markMessagesAsRead] = useMutation(MARK_MESSAGES_AS_READ);

	/** Cache booking summaries for conversation list device labels */
	useEffect(() => {
		if (myBookings.length) {
			setBookingMeta((prev) => {
				const next = { ...prev };
				myBookings.forEach((booking) => {
					if (!next[booking._id]) next[booking._id] = booking;
				});
				return next;
			});
		}
	}, [myBookings]);

	useEffect(() => {
		const ids = [
			...new Set(
				conversations
					.map((conversation) =>
						resolvePeerBookingId(conversation.peerId, rawConversations, conversation.bookingId),
					)
					.filter(Boolean),
			),
		] as string[];
		const missing = ids.filter((id) => !fetchedBookingIds.current.has(id));
		if (!missing.length) return;

		let cancelled = false;
		missing.forEach((id) => fetchedBookingIds.current.add(id));

		Promise.all(
			missing.map((bookingId) =>
				apolloClient
					.query<{ getBooking: Booking }>({
						query: GET_BOOKING,
						variables: { bookingId },
						fetchPolicy: 'cache-first',
					})
					.then((res) => ({ bookingId, booking: res.data?.getBooking }))
					.catch(() => null),
			),
		).then((results) => {
			if (cancelled) return;
			const next: Record<string, Booking> = {};
			results.forEach((entry) => {
				if (entry?.booking) next[entry.bookingId] = entry.booking;
			});
			if (Object.keys(next).length) {
				setBookingMeta((prev) => ({ ...prev, ...next }));
			}
		});

		return () => {
			cancelled = true;
		};
	}, [conversations, apolloClient]);

	/** LIFECYCLES **/
	useEffect(() => {
		if (!user?._id) {
			router.push('/').then();
		}
	}, [user]);

	useEffect(() => {
		if (queryPeerId) {
			const bookingId = resolvePeerBookingId(queryPeerId, rawConversations, queryBookingId ?? null);
			setSelected({ peerId: queryPeerId, bookingId });
			return;
		}
		if (!selected && conversations.length > 0) {
			const first = conversations[0];
			const bookingId = resolvePeerBookingId(first.peerId, rawConversations, first.bookingId);
			setSelected({ peerId: first.peerId, bookingId });
		}
	}, [queryPeerId, queryBookingId, conversations, rawConversations, selected]);

	useEffect(() => {
		if (!selected?.peerId || !user?._id) return;
		const conversation = conversations.find((c) => c.peerId === selected.peerId);
		if (conversation && conversation.unreadCount > 0) {
			markMessagesAsRead({
				variables: { input: { peerId: selected.peerId } },
			})
				.then(() => refetchConversations())
				.catch(() => undefined);
		}
	}, [selected?.peerId, conversations]);

	/** HANDLERS **/
	const selectConversation = (conversation: Conversation) => {
		const bookingId = resolvePeerBookingId(conversation.peerId, rawConversations, conversation.bookingId);
		setSelected({ peerId: conversation.peerId, bookingId });
	};

	const sendHandler = async ({ text, imageFile }: SendMessagePayload) => {
		if (!selected?.peerId) return;

		const send = async (messageContent: string, messageType: 'TEXT' | 'IMAGE') => {
			await sendMessage({
				variables: {
					input: {
						receiverId: selected.peerId,
						bookingId: activeBookingId || undefined,
						messageContent,
						messageType,
					},
				},
			});
			await refetchMessages();
			await refetchConversations();
		};

		try {
			if (imageFile) {
				const base64 = await fileToDataUrl(imageFile);
				await send(base64, 'IMAGE');
				return;
			}
			if (text?.trim()) {
				await send(text.trim(), 'TEXT');
			}
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	const activePeer = useMemo((): ConversationPeer | null => {
		const fromUser = peerData?.getUser;
		if (fromUser) return { ...fromUser };
		const fromConversation = conversations.find((c) => c.peerId === selected?.peerId)?.peer;
		if (fromConversation) return { ...fromConversation };
		return null;
	}, [conversations, selected?.peerId, peerData]);

	return (
		<div className="fixora-messages-page">
			<div className="container fixora-messages">
				<ConversationList
					conversations={conversations}
					selectedPeerId={selected?.peerId}
					bookingMeta={bookingMeta}
					onSelect={selectConversation}
				/>

				<ChatThread
					peer={activePeer}
					peerId={selected?.peerId}
					messages={messages}
					currentUserId={user?._id}
					currentUserImage={user?.memberImage}
					onSend={sendHandler}
					sending={sending}
					contextBar={booking ? <ChatBookingContextBar booking={booking} device={device} /> : undefined}
				/>

				<RequestDetailsPanel
					booking={booking}
					device={device}
					technician={activePeer}
					loading={!!activeBookingId && (bookingLoading || myBookingsLoading)}
				/>
			</div>
		</div>
	);
};

export default withLayoutFull(MessagesPage);
