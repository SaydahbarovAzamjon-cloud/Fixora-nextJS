import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import { ConversationPeer, Message } from '../../types/fixora/fixora';
import { resolveProfileImageUrl } from '../../utils/profileImage';
import UserProfileLink from '../common/UserProfileLink';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

export interface SendMessagePayload {
	text?: string;
	imageFile?: File;
}

interface ChatThreadProps {
	peer?: ConversationPeer | null;
	peerId?: string | null;
	messages: Message[];
	currentUserId?: string;
	currentUserImage?: string;
	onSend: (payload: SendMessagePayload) => void | Promise<void>;
	sending?: boolean;
	contextBar?: React.ReactNode;
}

const EMOJIS = [
	'😀', '😁', '😂', '🤣', '😊', '😍', '🥰', '😘', '😎', '🤔', '😅', '😭',
	'😤', '🤩', '😢', '😡', '🥳', '🤗', '😴', '🫶', '👍', '👎', '👏', '🙏',
	'🤝', '✌️', '🤞', '💪', '👋', '🙌', '👌', '🫡', '❤️', '🔥', '⭐', '✅',
	'❌', '💯', '🎉', '🚀', '💡', '🔧', '📱', '⚡', '🎁', '💬', '📸', '🛠️',
];

const formatTime = (dateStr?: string | null) => {
	if (!dateStr) return '';
	return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const ChatThread = ({
	peer,
	peerId,
	messages,
	currentUserId,
	currentUserImage,
	onSend,
	sending,
	contextBar,
}: ChatThreadProps) => {
	const { t } = useTranslation('common');
	const authUser = useReactiveVar(userVar);
	const [text, setText] = useState('');
	const [showEmoji, setShowEmoji] = useState(false);
	const [imgPreview, setImgPreview] = useState<{ file: File; url: string } | null>(null);
	const bottomRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const emojiRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ block: 'end' });
	}, [messages.length, imgPreview]);

	useEffect(() => {
		return () => {
			if (imgPreview?.url) URL.revokeObjectURL(imgPreview.url);
		};
	}, [imgPreview?.url]);

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
				setShowEmoji(false);
			}
		};
		if (showEmoji) document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, [showEmoji]);

	const submit = async () => {
		if (imgPreview) {
			await onSend({ imageFile: imgPreview.file });
			URL.revokeObjectURL(imgPreview.url);
			setImgPreview(null);
			return;
		}
		const trimmed = text.trim();
		if (!trimmed) return;
		await onSend({ text: trimmed });
		setText('');
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			submit();
		}
	};

	const insertEmoji = (emoji: string) => {
		const input = inputRef.current;
		if (!input) {
			setText((prev) => `${prev}${emoji}`);
			setShowEmoji(false);
			return;
		}
		const start = input.selectionStart ?? text.length;
		const end = input.selectionEnd ?? text.length;
		const next = text.slice(0, start) + emoji + text.slice(end);
		setText(next);
		setShowEmoji(false);
		setTimeout(() => {
			input.selectionStart = input.selectionEnd = start + emoji.length;
			input.focus();
		}, 0);
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const url = URL.createObjectURL(file);
		setImgPreview({ file, url });
		e.target.value = '';
	};

	const removePreview = () => {
		if (imgPreview?.url) URL.revokeObjectURL(imgPreview.url);
		setImgPreview(null);
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
	const canSend = Boolean(text.trim() || imgPreview);

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

			{contextBar}

			<div className="fixora-messages__thread-body">
				{messages.length === 0 && (
					<p className="fixora-messages__thread-empty">{t('messages.noMessages')}</p>
				)}
				{messages.map((message) => {
					const isMine = message.senderId === currentUserId;
					const isImage = message.messageType === 'IMAGE';
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
								<div className={`fixora-messages__bubble ${isMine ? 'fixora-messages__bubble--mine' : ''} ${isImage ? 'fixora-messages__bubble--image' : ''}`}>
									{isImage ? (
										<img src={message.messageContent} alt="" className="fixora-messages__bubble-img" />
									) : (
										<p>{message.messageContent}</p>
									)}
								</div>
								<div className="fixora-messages__bubble-meta">
									<span>{formatTime(message.createdAt)}</span>
									{isMine &&
										(message.isRead ? (
											<DoneAllRoundedIcon className="fixora-messages__read-icon fixora-messages__read-icon--read" fontSize="inherit" />
										) : (
											<DoneRoundedIcon className="fixora-messages__read-icon" fontSize="inherit" />
										))}
								</div>
							</div>
						</div>
					);
				})}
				<div ref={bottomRef} />
			</div>

			{imgPreview && (
				<div className="fixora-messages__img-preview">
					<img src={imgPreview.url} alt="" />
					<button type="button" className="fixora-messages__img-preview-remove" onClick={removePreview} aria-label={t('messages.removeImage')}>
						<CloseRoundedIcon fontSize="small" />
					</button>
				</div>
			)}

			<div className="fixora-messages__composer-wrap">
				{showEmoji && (
					<div className="fixora-messages__emoji-picker" ref={emojiRef}>
						{EMOJIS.map((emoji) => (
							<button key={emoji} type="button" className="fixora-messages__emoji-btn" onClick={() => insertEmoji(emoji)}>
								{emoji}
							</button>
						))}
					</div>
				)}

				<div className="fixora-messages__thread-input">
					<input ref={fileInputRef} type="file" accept="image/*" className="fixora-messages__file-input" onChange={handleFileChange} />
					<button
						type="button"
						className="fixora-messages__icon-btn"
						onClick={() => fileInputRef.current?.click()}
						aria-label={t('messages.attachImage')}
					>
						<AttachFileOutlinedIcon fontSize="small" />
					</button>
					<input
						ref={inputRef}
						type="text"
						placeholder={t('messages.typePlaceholder')}
						value={text}
						onChange={(e) => setText(e.target.value)}
						onKeyDown={onKeyDown}
					/>
					<button
						type="button"
						className={`fixora-messages__icon-btn ${showEmoji ? 'fixora-messages__icon-btn--active' : ''}`}
						onClick={() => setShowEmoji((prev) => !prev)}
						aria-label={t('messages.emoji')}
					>
						<EmojiEmotionsIcon fontSize="small" />
					</button>
					<button
						type="button"
						className="fixora-messages__send"
						onClick={submit}
						disabled={!canSend || sending}
						aria-label={t('messages.send')}
					>
						<SendIcon fontSize="small" />
					</button>
				</div>
			</div>
		</div>
	);
};

export default ChatThread;
