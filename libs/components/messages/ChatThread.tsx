import React, { useEffect, useRef, useState } from 'react';
import Moment from 'react-moment';
import { useTranslation } from 'next-i18next';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { ConversationPeer, Message } from '../../types/fixora/fixora';
import { resolveProfileImageUrl } from '../../utils/profileImage';
import UserProfileLink from '../common/UserProfileLink';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

interface ChatThreadProps {
	peer?: ConversationPeer | null;
	peerId?: string | null;
	messages: Message[];
	currentUserId?: string;
	currentUserImage?: string;
	onSend: (text: string) => void | Promise<void>;
	sending?: boolean;
}

const ChatThread = ({ peer, peerId, messages, currentUserId, currentUserImage, onSend, sending }: ChatThreadProps) => {
	const { t } = useTranslation('common');
	const authUser = useReactiveVar(userVar);
	const [text, setText] = useState('');
	const [likedMessages, setLikedMessages] = useState<Set<string>>(new Set());
	const bottomRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ block: 'end' });
	}, [messages.length]);

	const submit = () => {
		const trimmed = text.trim();
		if (!trimmed) return;
		onSend(trimmed);
		setText('');
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			submit();
		}
	};

	const toggleLike = (messageId: string) => {
		setLikedMessages((prev) => {
			const next = new Set(prev);
			if (next.has(messageId)) {
				next.delete(messageId);
			} else {
				next.add(messageId);
			}
			return next;
		});
	};

	const addEmoji = () => {
		setText((prev) => `${prev}🙂`);
	};

	if (!peer) {
		return (
			<div className="fixora-messages__thread fixora-messages__thread--empty">
				<ChatBubbleOutlineIcon fontSize="large" />
				<p>{t('messages.selectConversation')}</p>
			</div>
		);
	}

	const displayName = peer.shopName || peer.userFullName || peer.userNickname || '';
	const resolvedPeerId = peerId || peer._id;

	return (
		<div className="fixora-messages__thread">
			<div className="fixora-messages__thread-header">
				<UserProfileLink userId={resolvedPeerId} userType={peer.userType} className="fixora-messages__profile-link fixora-messages__profile-link--avatar">
					<span className="fixora-messages__avatar">
						<img src={resolveProfileImageUrl(peer.userProfileImage)} alt="" />
						{peer.isOnline && <span className="fixora-messages__online-dot" />}
					</span>
				</UserProfileLink>
				<span className="fixora-messages__thread-info">
					<UserProfileLink userId={resolvedPeerId} userType={peer.userType} className="fixora-messages__profile-link fixora-messages__profile-link--name">
						<strong>{displayName}</strong>
					</UserProfileLink>
					<span className={`fixora-messages__thread-status ${peer.isOnline ? 'fixora-messages__thread-status--online' : ''}`}>
						{peer.isOnline ? t('messages.online') : t('messages.offline')}
					</span>
				</span>
				<button type="button" className="fixora-messages__expand" aria-label={t('messages.expand')}>
					<OpenInFullIcon fontSize="small" />
				</button>
			</div>

			<div className="fixora-messages__thread-body">
				{messages.map((message) => {
					const isMine = message.senderId === currentUserId;
					const isLiked = likedMessages.has(message._id);
					const avatarSrc = isMine ? resolveProfileImageUrl(currentUserImage) : resolveProfileImageUrl(peer.userProfileImage);
					const avatarUserId = isMine ? currentUserId : resolvedPeerId;
					return (
						<div
							key={message._id}
							className={`fixora-messages__bubble-row ${isMine ? 'fixora-messages__bubble-row--mine' : ''}`}
						>
							<UserProfileLink
								userId={avatarUserId}
								userType={isMine ? (authUser?.userType as string | undefined) : peer.userType}
								className="fixora-messages__profile-link fixora-messages__profile-link--bubble"
								stopPropagation={false}
							>
								<img className="fixora-messages__bubble-avatar" src={avatarSrc} alt="" />
							</UserProfileLink>
							<div className="fixora-messages__bubble-group">
								<div className={`fixora-messages__bubble ${isMine ? 'fixora-messages__bubble--mine' : ''}`}>
									<p>{message.messageContent}</p>
									<button
										type="button"
										className={`fixora-messages__like ${isLiked ? 'fixora-messages__like--active' : ''}`}
										onClick={() => toggleLike(message._id)}
										aria-label={t('messages.like')}
									>
										{isLiked ? <FavoriteIcon fontSize="inherit" /> : <FavoriteBorderIcon fontSize="inherit" />}
									</button>
								</div>
								<Moment format="HH:mm" className="fixora-messages__bubble-time">
									{message.createdAt}
								</Moment>
							</div>
						</div>
					);
				})}
				<div ref={bottomRef} />
			</div>

			<div className="fixora-messages__thread-input">
				<input
					type="text"
					placeholder={t('messages.typePlaceholder')}
					value={text}
					onChange={(e) => setText(e.target.value)}
					onKeyDown={onKeyDown}
				/>
				<button type="button" className="fixora-messages__icon-btn" onClick={addEmoji} aria-label={t('messages.emoji')}>
					<EmojiEmotionsIcon fontSize="small" />
				</button>
				<button
					type="button"
					className="fixora-messages__send"
					onClick={submit}
					disabled={!text.trim() || sending}
					aria-label={t('messages.send')}
				>
					<SendIcon fontSize="small" />
				</button>
			</div>
		</div>
	);
};

export default ChatThread;
