import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import DoneRounded from '@mui/icons-material/DoneRounded';
import DoneAllRounded from '@mui/icons-material/DoneAllRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';
import { GET_MY_CONVERSATIONS, GET_MESSAGES, SEND_MESSAGE, MARK_MESSAGES_AS_READ } from '../../../apollo/user/message';
import { GET_BOOKING, GET_DEVICE } from '../../../apollo/user/query';
import { userVar } from '../../../apollo/store';
import { Conversation, Message } from '../../../libs/types/fixora/fixora';
import { sweetErrorHandling } from '../../../libs/sweetAlert';
import { resolveProfileImageUrl } from '../../../libs/utils/profileImage';
import UserProfileLink from '../../../libs/components/common/UserProfileLink';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: { ...(await serverSideTranslations(locale ?? 'en', ['common'])) },
});

const EMOJIS = [
	'😀','😁','😂','🤣','😊','😍','🥰','😘','😎','🤔','😅','😭',
	'😤','🤩','😢','😡','🥳','🤗','😴','🫶','👍','👎','👏','🙏',
	'🤝','✌️','🤞','💪','👋','🙌','👌','🫡','❤️','🔥','⭐','✅',
	'❌','💯','🎉','🚀','💡','🔧','📱','⚡','🎁','💬','📸','🛠️',
];

const peerName = (conv?: Conversation | null) =>
	conv?.peer?.userFullName || conv?.peer?.userNickname || conv?.peer?.shopName || 'Customer';

const initialsOf = (name: string) => {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return 'C';
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[1][0]).toUpperCase();
};

const hasImage = (image?: string | null) => !!image && image.trim() !== '';

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
	const [showEmoji, setShowEmoji] = useState(false);
	const [imgPreview, setImgPreview] = useState<{ file: File; url: string } | null>(null);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const emojiRef = useRef<HTMLDivElement>(null);

	/** APOLLO **/
	const { data: conversationsData, loading: convsLoading, refetch: refetchConversations } = useQuery(GET_MY_CONVERSATIONS, {
		skip: !user?._id,
		variables: { input: { page: 1, limit: 50 } },
		fetchPolicy: 'network-only',
		pollInterval: 15000,
	});

	const conversations: Conversation[] = conversationsData?.getMyConversations?.list ?? [];

	// FIX 1: show skeleton until data actually arrives (prevents "no data" flash)
	const isConvsLoading = !user?._id || convsLoading || !conversationsData;

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

	// Close emoji picker on outside click
	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
				setShowEmoji(false);
			}
		};
		if (showEmoji) document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, [showEmoji]);

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
		if (!selected?.peerId) return;

		// FIX 3: send image if preview exists
		if (imgPreview) {
			const reader = new FileReader();
			reader.onloadend = async () => {
				const base64 = reader.result as string;
				try {
					await sendMessage({
						variables: {
							input: {
								receiverId: selected.peerId,
								bookingId: selected.bookingId || undefined,
								messageContent: base64,
								messageType: 'IMAGE',
							},
						},
					});
					setImgPreview(null);
					await refetchMessages();
					await refetchConversations();
				} catch (err: any) {
					await sweetErrorHandling(err);
				}
			};
			reader.readAsDataURL(imgPreview.file);
			return;
		}

		const text = draft.trim();
		if (!text) return;
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

	// FIX 4: insert emoji at cursor position
	const insertEmoji = (emoji: string) => {
		const textarea = textareaRef.current;
		if (!textarea) {
			setDraft((d) => d + emoji);
			setShowEmoji(false);
			return;
		}
		const start = textarea.selectionStart ?? draft.length;
		const end = textarea.selectionEnd ?? draft.length;
		const newVal = draft.slice(0, start) + emoji + draft.slice(end);
		setDraft(newVal);
		setShowEmoji(false);
		setTimeout(() => {
			textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
			textarea.focus();
		}, 0);
	};

	// FIX 3: handle file selection
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const url = URL.createObjectURL(file);
		setImgPreview({ file, url });
		e.target.value = '';
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
							const peerId = conv.peerId;
							return (
								<div
									key={`${conv.peerId}-${conv.bookingId ?? 'none'}`}
									className={`fixora-msg-conv ${conv.peerId === selected?.peerId ? 'fixora-msg-conv--active' : ''}`}
								>
									<UserProfileLink userId={peerId} userType={conv.peer?.userType} className="fixora-profile-link fixora-msg-conv__profile-link">
										<div className="fixora-msg-conv__avatar-wrap">
											<Avatar image={conv.peer?.userProfileImage} name={name} className="fixora-msg-conv__avatar" />
											{conv.peer?.isOnline && <span className="fixora-msg-conv__dot" />}
										</div>
									</UserProfileLink>
									<button
										className="fixora-msg-conv__select"
										onClick={() => setSelected({ peerId: conv.peerId, bookingId: conv.bookingId ?? null })}
										type="button"
									>
										<div className="fixora-msg-conv__body">
											<div className="fixora-msg-conv__row">
												<UserProfileLink userId={peerId} userType={conv.peer?.userType} className="fixora-profile-link fixora-msg-conv__profile-link fixora-msg-conv__profile-link--name">
													<span className="fixora-msg-conv__name">{name}</span>
												</UserProfileLink>
												<span className="fixora-msg-conv__meta">
													<span className="fixora-msg-conv__time">{timeAgo(conv.updatedAt)}</span>
													{conv.unreadCount > 0 && <span className="fixora-msg-conv__unread">{conv.unreadCount}</span>}
												</span>
											</div>
											<div className="fixora-msg-conv__preview">{conv.lastMessage?.messageContent ?? ''}</div>
											{code && <div className="fixora-msg-conv__code">{code}</div>}
										</div>
									</button>
								</div>
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
							<UserProfileLink userId={activeConversation.peerId} userType={activeConversation.peer?.userType} className="fixora-profile-link fixora-msg-conv__profile-link">
								<div className="fixora-msg-conv__avatar-wrap">
									<Avatar image={activeConversation.peer?.userProfileImage} name={activeName} className="fixora-msg-chat__avatar" />
									{activeConversation.peer?.isOnline && <span className="fixora-msg-conv__dot" />}
								</div>
							</UserProfileLink>
							<div className="fixora-msg-chat__head-info">
								<UserProfileLink userId={activeConversation.peerId} userType={activeConversation.peer?.userType} className="fixora-profile-link fixora-msg-conv__profile-link fixora-msg-conv__profile-link--name">
									<div className="fixora-msg-chat__name">{activeName}</div>
								</UserProfileLink>
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
								const isImg = (m as any).messageType === 'IMAGE';
								return (
									<div key={m._id} className={`fixora-msg-row fixora-msg-row--${dir}`}>
										{dir === 'in' && (
											<UserProfileLink userId={activeConversation.peerId} userType={activeConversation.peer?.userType} className="fixora-profile-link fixora-msg-conv__profile-link" stopPropagation={false}>
												<Avatar image={activeConversation.peer?.userProfileImage} name={activeName} className="fixora-msg-row__avatar" />
											</UserProfileLink>
										)}
										<div className="fixora-msg-row__wrap">
											<div className={`fixora-msg-bubble fixora-msg-bubble--${dir}`}>
												{isImg
													? <img src={m.messageContent} alt="image" className="fixora-msg-bubble__img" />
													: m.messageContent}
											</div>
											<div className="fixora-msg-bubble__meta">
												{formatTime(m.createdAt)}
												{/* FIX 2: 1 check = sent (not read), 2 checks = read */}
												{dir === 'out' && (
													m.isRead
														? <DoneAllRounded style={{ fontSize: 14, color: '#FF9A3C' }} />
														: <DoneRounded style={{ fontSize: 14, color: '#606060' }} />
												)}
											</div>
										</div>
										{dir === 'out' && (
											<UserProfileLink userId={user?._id} className="fixora-profile-link fixora-msg-conv__profile-link" stopPropagation={false}>
												<Avatar image={myImage} name={myName} className="fixora-msg-row__avatar" />
											</UserProfileLink>
										)}
									</div>
								);
							})}
						</div>

						<div className="fixora-msg-composer-wrap">
							{/* FIX 3: image preview strip */}
							{imgPreview && (
								<div className="fixora-msg-img-preview">
									<img src={imgPreview.url} alt="preview" />
									<button
										type="button"
										className="fixora-msg-img-preview__remove"
										onClick={() => { URL.revokeObjectURL(imgPreview.url); setImgPreview(null); }}
									>
										<CloseRounded style={{ fontSize: 14 }} />
									</button>
								</div>
							)}

							{/* FIX 4: emoji picker */}
							{showEmoji && (
								<div className="fixora-msg-emoji-picker" ref={emojiRef}>
									{EMOJIS.map((e) => (
										<button key={e} type="button" className="fixora-msg-emoji-btn" onClick={() => insertEmoji(e)}>
											{e}
										</button>
									))}
								</div>
							)}

							<div className="fixora-msg-composer">
								{/* FIX 3: hidden file input */}
								<input
									ref={fileInputRef}
									type="file"
									accept="image/*"
									style={{ display: 'none' }}
									onChange={handleFileChange}
								/>
								<button
									className="fixora-msg-composer__attach"
									type="button"
									onClick={() => fileInputRef.current?.click()}
								>
									<AttachFileOutlined style={{ fontSize: 18 }} />
								</button>
								<textarea
									ref={textareaRef}
									className="fixora-msg-composer__input"
									placeholder="Type a message..."
									rows={1}
									value={draft}
									onChange={(e) => setDraft(e.target.value)}
									onKeyDown={handleKeyDown}
								/>
								{/* FIX 4: emoji button toggles picker */}
								<button
									className="fixora-msg-composer__emoji"
									type="button"
									onClick={() => setShowEmoji((v) => !v)}
								>
									<SentimentSatisfiedAltOutlined style={{ fontSize: 19 }} />
								</button>
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
