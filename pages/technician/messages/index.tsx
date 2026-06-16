import React, { useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import CallOutlined from '@mui/icons-material/CallOutlined';
import VideocamOutlined from '@mui/icons-material/VideocamOutlined';
import MoreHorizOutlined from '@mui/icons-material/MoreHorizOutlined';
import SmartphoneOutlined from '@mui/icons-material/SmartphoneOutlined';
import AttachFileOutlined from '@mui/icons-material/AttachFileOutlined';
import SentimentSatisfiedAltOutlined from '@mui/icons-material/SentimentSatisfiedAltOutlined';
import SendRounded from '@mui/icons-material/SendRounded';
import DoneAllRounded from '@mui/icons-material/DoneAllRounded';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';
import { GET_MY_CONVERSATIONS, GET_MESSAGES, SEND_MESSAGE, MARK_MESSAGES_AS_READ } from '../../../apollo/user/message';
import { GET_BOOKING, GET_DEVICE } from '../../../apollo/user/query';
import { userVar } from '../../../apollo/store';
import { Conversation, Message } from '../../../libs/types/fixora/fixora';
import { sweetErrorHandling } from '../../../libs/sweetAlert';
import { resolveProfileImageUrl } from '../../../libs/utils/profileImage';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: { ...(await serverSideTranslations(locale ?? 'en', ['common'])) },
});

const peerName = (conv?: Conversation | null) =>
	conv?.peer?.userFullName || conv?.peer?.userNickname || conv?.peer?.shopName || 'Customer';

const initialsOf = (name: string) => {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return 'C';
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[1][0]).toUpperCase();
};

const hasImage = (image?: string | null) => !!image && image.trim() !== '';

/** Avatar that shows the real profile image when available, else initials. */
const Avatar = ({ image, name, className }: { image?: string | null; name: string; className: string }) => (
	<div className={className}>
		{hasImage(image) ? <img src={resolveProfileImageUrl(image)} alt={name} /> : initialsOf(name)}
	</div>
);

const bookingCode = (conv?: Conversation | null) => {
	if (!conv?.bookingId) return '';
	const suffix = conv.bookingId.slice(-4).toUpperCase();
	const prefix = conv.bookingStatus === 'PENDING' ? 'REQ' : 'JOB';
	return `${prefix}-${suffix}`;
};

const timeAgo = (dateStr?: string | null) => {
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

const formatTime = (dateStr?: string | null) => {
	if (!dateStr) return '';
	return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const Messages: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const queryPeerId = router.query.peerId as string | undefined;
	const queryBookingId = router.query.bookingId as string | undefined;

	const [search, setSearch] = useState('');
	const [selected, setSelected] = useState<{ peerId: string; bookingId?: string | null } | null>(null);
	const [draft, setDraft] = useState('');

	/** APOLLO **/
	const { data: conversationsData, loading: convsLoading, refetch: refetchConversations } = useQuery(GET_MY_CONVERSATIONS, {
		skip: !user?._id,
		variables: { input: { page: 1, limit: 50 } },
		fetchPolicy: 'network-only',
		pollInterval: 15000,
	});

	const conversations: Conversation[] = conversationsData?.getMyConversations?.list ?? [];

	const { data: messagesData, loading: msgsLoading, refetch: refetchMessages } = useQuery(GET_MESSAGES, {
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

	const isConvsLoading = !user?._id || convsLoading;

	const messages: Message[] = messagesData?.getMessages?.list ?? [];

	const { data: bookingData } = useQuery(GET_BOOKING, {
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
	const deviceLabel = device
		? [device.deviceBrand, device.deviceModel].filter(Boolean).join(' ')
		: booking?.problemTitle || '';

	const [sendMessage] = useMutation(SEND_MESSAGE);
	const [markMessagesAsRead] = useMutation(MARK_MESSAGES_AS_READ);

	/** LIFECYCLES **/
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

	/** DERIVED **/
	const filteredConversations = useMemo(
		() => conversations.filter((c) => peerName(c).toLowerCase().includes(search.toLowerCase())),
		[conversations, search]
	);

	const activeConversation = useMemo(
		() => conversations.find((c) => c.peerId === selected?.peerId) ?? null,
		[conversations, selected?.peerId]
	);

	/** HANDLERS **/
	const sendHandler = async () => {
		const text = draft.trim();
		if (!text || !selected?.peerId) return;
		setDraft('');
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

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendHandler();
		}
	};

	const activeName = peerName(activeConversation);
	const activeCode = bookingCode(activeConversation);
	const myImage = user?.memberImage;
	const myName = user?.memberFullName || user?.memberNick || 'Me';

	return (
		<div className="fixora-msg-page">
			{/* Conversation list */}
			<div className="fixora-msg-left">
				<div className="fixora-msg-search-wrap">
					<div className="fixora-msg-search">
						<SearchOutlined style={{ fontSize: 17 }} />
						<input
							type="text"
							placeholder="Search conversations..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
				</div>

				<div className="fixora-msg-conv-list">
					{isConvsLoading ? (
						<>
							{[1, 2, 3].map((i) => (
								<div key={i} className="fixora-msg-conv-skeleton">
									<div className="fixora-msg-conv-skeleton__avatar" />
									<div className="fixora-msg-conv-skeleton__body">
										<div className="fixora-msg-conv-skeleton__line fixora-msg-conv-skeleton__line--name" />
										<div className="fixora-msg-conv-skeleton__line fixora-msg-conv-skeleton__line--preview" />
									</div>
								</div>
							))}
						</>
					) : filteredConversations.length === 0 ? (
						<div className="fixora-tech-empty">No conversations yet</div>
					) : (
						filteredConversations.map((conv) => {
							const name = peerName(conv);
							const code = bookingCode(conv);
							return (
								<button
									key={`${conv.peerId}-${conv.bookingId ?? 'none'}`}
									className={`fixora-msg-conv ${conv.peerId === selected?.peerId ? 'fixora-msg-conv--active' : ''}`}
									onClick={() => setSelected({ peerId: conv.peerId, bookingId: conv.bookingId ?? null })}
									type="button"
								>
									<div className="fixora-msg-conv__avatar-wrap">
										<Avatar image={conv.peer?.userProfileImage} name={name} className="fixora-msg-conv__avatar" />
										{conv.peer?.isOnline && <span className="fixora-msg-conv__dot" />}
									</div>
									<div className="fixora-msg-conv__body">
										<div className="fixora-msg-conv__row">
											<span className="fixora-msg-conv__name">{name}</span>
											<span className="fixora-msg-conv__meta">
												<span className="fixora-msg-conv__time">{timeAgo(conv.updatedAt)}</span>
												{conv.unreadCount > 0 && <span className="fixora-msg-conv__unread">{conv.unreadCount}</span>}
											</span>
										</div>
										<div className="fixora-msg-conv__preview">{conv.lastMessage?.messageContent ?? ''}</div>
										{code && <div className="fixora-msg-conv__code">{code}</div>}
									</div>
								</button>
							);
						})
					)}
				</div>
			</div>

			{/* Chat area */}
			<div className="fixora-msg-chat">
				{activeConversation ? (
					<>
						<div className="fixora-msg-chat__header">
							<div className="fixora-msg-conv__avatar-wrap">
								<Avatar image={activeConversation.peer?.userProfileImage} name={activeName} className="fixora-msg-chat__avatar" />
								{activeConversation.peer?.isOnline && <span className="fixora-msg-conv__dot" />}
							</div>
							<div className="fixora-msg-chat__head-info">
								<div className="fixora-msg-chat__name">{activeName}</div>
								<div className="fixora-msg-chat__status">
									{activeConversation.peer?.isOnline && <span className="fixora-msg-chat__status-dot" />}
									{activeConversation.peer?.isOnline ? 'Online' : 'Offline'}
									{deviceLabel ? ` · ${deviceLabel}` : ''}
								</div>
							</div>
							<div className="fixora-msg-chat__actions">
								<button className="fixora-msg-icon-btn" type="button"><CallOutlined style={{ fontSize: 18 }} /></button>
								<button className="fixora-msg-icon-btn" type="button"><VideocamOutlined style={{ fontSize: 19 }} /></button>
								<button className="fixora-msg-icon-btn" type="button"><MoreHorizOutlined style={{ fontSize: 20 }} /></button>
							</div>
						</div>

						{(activeCode || deviceLabel) && (
							<div className="fixora-msg-chat__context">
								<SmartphoneOutlined style={{ fontSize: 16 }} />
								<span>{[activeCode, deviceLabel].filter(Boolean).join(' — ')}</span>
							</div>
						)}

						<div className="fixora-msg-chat__body">
							{msgsLoading ? (
								<div className="fixora-msg-loading">
									<div className="fixora-msg-loading__spinner" />
								</div>
							) : messages.length === 0 ? (
								<div className="fixora-tech-empty" style={{ margin: 'auto' }}>No messages yet. Say hello!</div>
							) : null}
							{!msgsLoading && messages.map((m) => {
								const dir = m.senderId === user?._id ? 'out' : 'in';
								return (
									<div key={m._id} className={`fixora-msg-row fixora-msg-row--${dir}`}>
										{dir === 'in' && (
											<Avatar image={activeConversation.peer?.userProfileImage} name={activeName} className="fixora-msg-row__avatar" />
										)}
										<div className="fixora-msg-row__wrap">
											<div className={`fixora-msg-bubble fixora-msg-bubble--${dir}`}>{m.messageContent}</div>
											<div className="fixora-msg-bubble__meta">
												{formatTime(m.createdAt)}
												{dir === 'out' && <DoneAllRounded style={{ fontSize: 14, color: m.isRead ? '#FF9A3C' : undefined }} />}
											</div>
										</div>
										{dir === 'out' && (
											<Avatar image={myImage} name={myName} className="fixora-msg-row__avatar" />
										)}
									</div>
								);
							})}
						</div>

						<div className="fixora-msg-composer-wrap">
							<div className="fixora-msg-composer">
								<button className="fixora-msg-composer__attach" type="button"><AttachFileOutlined style={{ fontSize: 18 }} /></button>
								<textarea
									className="fixora-msg-composer__input"
									placeholder="Type a message..."
									rows={1}
									value={draft}
									onChange={(e) => setDraft(e.target.value)}
									onKeyDown={handleKeyDown}
								/>
								<button className="fixora-msg-composer__emoji" type="button"><SentimentSatisfiedAltOutlined style={{ fontSize: 19 }} /></button>
								<button className="fixora-msg-composer__send" type="button" onClick={sendHandler}>
									<SendRounded style={{ fontSize: 18 }} />
								</button>
							</div>
							<div className="fixora-msg-composer__hint">
								Press <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for new line
							</div>
						</div>
					</>
				) : (isConvsLoading || (!selected && conversations.length > 0)) ? (
					<div className="fixora-msg-loading" style={{ margin: 'auto' }}>
						<div className="fixora-msg-loading__spinner" />
					</div>
				) : (
					<div className="fixora-tech-empty" style={{ margin: 'auto' }}>Select a conversation to start chatting</div>
				)}
			</div>
		</div>
	);
};

export default withTechnicianLayout(Messages);
