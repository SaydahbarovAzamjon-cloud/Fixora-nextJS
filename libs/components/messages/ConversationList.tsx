import React, { useState } from 'react';
import Moment from 'react-moment';
import { useTranslation } from 'next-i18next';
import SearchIcon from '@mui/icons-material/Search';
import { Conversation } from '../../types/fixora/fixora';
import { resolveProfileImageUrl } from '../../utils/profileImage';

interface ConversationListProps {
	conversations: Conversation[];
	selectedPeerId?: string | null;
	onSelect: (conversation: Conversation) => void;
}

const ConversationList = ({ conversations, selectedPeerId, onSelect }: ConversationListProps) => {
	const { t } = useTranslation('common');
	const [search, setSearch] = useState('');

	const filtered = conversations.filter((conversation) => {
		const name =
			conversation.peer?.shopName || conversation.peer?.userFullName || conversation.peer?.userNickname || '';
		return name.toLowerCase().includes(search.toLowerCase());
	});

	return (
		<div className="fixora-messages__sidebar">
			<h2 className="fixora-messages__sidebar-title">{t('messages.chats')}</h2>

			<div className="fixora-messages__search">
				<SearchIcon fontSize="small" />
				<input
					type="text"
					placeholder={t('messages.searchPlaceholder')}
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
			</div>

			<div className="fixora-messages__conversations">
				{filtered.length === 0 && <p className="fixora-messages__empty">{t('messages.noConversations')}</p>}

				{filtered.map((conversation) => {
					const peer = conversation.peer;
					const displayName = peer?.shopName || peer?.userFullName || peer?.userNickname || '';
					const isActive = conversation.peerId === selectedPeerId;
					const lastMessage = conversation.lastMessage?.messageContent ?? '';

					return (
						<button
							key={conversation.peerId}
							type="button"
							className={`fixora-messages__conversation ${isActive ? 'fixora-messages__conversation--active' : ''}`}
							onClick={() => onSelect(conversation)}
						>
							<span className="fixora-messages__avatar">
								<img src={resolveProfileImageUrl(peer?.userProfileImage)} alt="" />
								{peer?.isOnline && <span className="fixora-messages__online-dot" />}
							</span>

							<span className="fixora-messages__conversation-body">
								<span className="fixora-messages__conversation-row">
									<strong>{displayName}</strong>
									<Moment fromNow ago className="fixora-messages__time">
										{conversation.updatedAt}
									</Moment>
								</span>
								<span className="fixora-messages__conversation-row">
									<span className="fixora-messages__preview">{lastMessage}</span>
									{conversation.unreadCount > 0 && (
										<span className="fixora-messages__unread">{conversation.unreadCount}</span>
									)}
								</span>
							</span>
						</button>
					);
				})}
			</div>
		</div>
	);
};

export default ConversationList;
