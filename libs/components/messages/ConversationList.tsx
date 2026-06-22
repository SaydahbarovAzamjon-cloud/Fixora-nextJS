import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import SearchIcon from '@mui/icons-material/Search';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import { Booking, Conversation } from '../../types/fixora/fixora';
import { formatConversationTime, formatMessagePreview } from '../../utils/messageHelpers';
import { deviceLabel } from '../mypage/fixora/myPageHelpers';
import { resolveProfileImageUrl } from '../../utils/profileImage';
import UserProfileLink from '../common/UserProfileLink';

interface ConversationListProps {
	conversations: Conversation[];
	selectedPeerId?: string | null;
	bookingMeta?: Record<string, Booking>;
	onSelect: (conversation: Conversation) => void;
}

const ConversationList = ({ conversations, selectedPeerId, bookingMeta = {}, onSelect }: ConversationListProps) => {
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
					const peerId = conversation.peerId || peer?._id;
					const isActive = conversation.peerId === selectedPeerId;
					const preview = formatMessagePreview(conversation.lastMessage, t);
					const booking = conversation.bookingId ? bookingMeta[conversation.bookingId] : undefined;
					const deviceText =
						conversation.deviceLabel ||
						(booking && conversation.bookingId ? deviceLabel(booking, t) : '');

					return (
						<div
							key={conversation.peerId}
							className={`fixora-messages__conversation ${isActive ? 'fixora-messages__conversation--active' : ''}`}
						>
							<UserProfileLink userId={peerId} userType={peer?.userType} className="fixora-messages__profile-link fixora-messages__profile-link--avatar">
								<span className="fixora-messages__avatar">
									<img src={resolveProfileImageUrl(peer?.userProfileImage)} alt="" />
									{peer?.isOnline && <span className="fixora-messages__online-dot" />}
								</span>
							</UserProfileLink>

							<button type="button" className="fixora-messages__conversation-select" onClick={() => onSelect(conversation)}>
								<span className="fixora-messages__conversation-body">
									<span className="fixora-messages__conversation-row fixora-messages__conversation-row--header">
										<span className="fixora-messages__conversation-name-wrap">
											<strong className="fixora-messages__conversation-name">{displayName}</strong>
											{peer?.isVerified && (
												<VerifiedOutlinedIcon className="fixora-messages__verified-icon" fontSize="inherit" />
											)}
										</span>
										<span className="fixora-messages__time">{formatConversationTime(conversation.updatedAt)}</span>
									</span>
									<span className="fixora-messages__preview">{preview}</span>
									{(conversation.bookingStatus || deviceText || conversation.unreadCount > 0) && (
										<span className="fixora-messages__conversation-row fixora-messages__conversation-row--footer">
											<span className="fixora-messages__conversation-footer-left">
												{conversation.bookingStatus && (
													<span className={`fixora-messages__status fixora-messages__status--${conversation.bookingStatus.toLowerCase()}`}>
														{t(`booking.status.${conversation.bookingStatus}`)}
													</span>
												)}
												{deviceText && <span className="fixora-messages__conversation-device">{deviceText}</span>}
											</span>
											{conversation.unreadCount > 0 && (
												<span className="fixora-messages__unread">{conversation.unreadCount}</span>
											)}
										</span>
									)}
								</span>
							</button>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default ConversationList;
