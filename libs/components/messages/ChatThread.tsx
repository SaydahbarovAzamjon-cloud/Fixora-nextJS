import React, { useEffect, useRef, useState } from 'react';
import Moment from 'react-moment';
import { useTranslation } from 'next-i18next';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { ConversationPeer, Message } from '../../types/fixora/fixora';
import { resolveProfileImageUrl } from '../../utils/profileImage';

interface ChatThreadProps {
	peer?: ConversationPeer | null;
	messages: Message[];
	currentUserId?: string;
	onSend: (text: string) => void | Promise<void>;
	sending?: boolean;
}

const ChatThread = ({ peer, messages, currentUserId, onSend, sending }: ChatThreadProps) => {
	const { t } = useTranslation('common');
	const [text, setText] = useState('');
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

	if (!peer) {
		return (
			<div className="fixora-messages__thread fixora-messages__thread--empty">
				<ChatBubbleOutlineIcon fontSize="large" />
				<p>{t('messages.selectConversation')}</p>
			</div>
		);
	}

	const displayName = peer.shopName || peer.userFullName || peer.userNickname || '';

	return (
		<div className="fixora-messages__thread">
			<div className="fixora-messages__thread-header">
				<span className="fixora-messages__avatar">
					<img src={resolveProfileImageUrl(peer.userProfileImage)} alt="" />
					{peer.isOnline && <span className="fixora-messages__online-dot" />}
				</span>
				<span className="fixora-messages__thread-info">
					<strong>{displayName}</strong>
					<span className="fixora-messages__thread-status">
						{peer.isOnline ? t('messages.online') : t('messages.offline')}
					</span>
				</span>
			</div>

			<div className="fixora-messages__thread-body">
				{messages.map((message) => {
					const isMine = message.senderId === currentUserId;
					return (
						<div
							key={message._id}
							className={`fixora-messages__bubble-row ${isMine ? 'fixora-messages__bubble-row--mine' : ''}`}
						>
							<div className={`fixora-messages__bubble ${isMine ? 'fixora-messages__bubble--mine' : ''}`}>
								<p>{message.messageContent}</p>
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
