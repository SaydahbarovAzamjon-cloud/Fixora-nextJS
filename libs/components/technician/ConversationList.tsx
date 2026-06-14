import React, { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';

interface Conversation {
	id: string;
	customerName: string;
	customerImage?: string;
	lastMessage: string;
	timestamp: string;
	isUnread: boolean;
	bookingId?: string;
	status?: string;
}

interface ConversationListProps {
	conversations: Conversation[];
	selectedId?: string;
	onSelectConversation: (id: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
	conversations,
	selectedId,
	onSelectConversation,
}) => {
	const [searchText, setSearchText] = useState('');

	const filteredConversations = conversations.filter((conv) =>
		conv.customerName.toLowerCase().includes(searchText.toLowerCase())
	);

	return (
		<div className="fixora-conversation-list">
			{/* Header */}
			<div className="fixora-conversations__header">
				<h2 className="fixora-conversations__title">Chats</h2>
				<span className="fixora-conversations__count">
					{filteredConversations.length}
				</span>
			</div>

			{/* Search */}
			<div className="fixora-conversations__search">
				<SearchIcon />
				<input
					type="text"
					placeholder="Search conversations..."
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
				/>
			</div>

			{/* Conversations List */}
			<div className="fixora-conversations__items">
				{filteredConversations.length > 0 ? (
					filteredConversations.map((conversation) => (
						<div
							key={conversation.id}
							className={`fixora-conversation-card ${
								selectedId === conversation.id
									? 'fixora-conversation-card--active'
									: ''
							} ${
								conversation.isUnread
									? 'fixora-conversation-card--unread'
									: ''
							}`}
							onClick={() => onSelectConversation(conversation.id)}
						>
							{/* Avatar */}
							<div className="fixora-conversation-card__avatar">
								{conversation.customerImage ? (
									<img
										src={conversation.customerImage}
										alt={conversation.customerName}
									/>
								) : (
									conversation.customerName
										.split(' ')
										.map((n) => n[0])
										.join('')
										.substring(0, 2)
										.toUpperCase()
								)}
								{conversation.isUnread && (
									<span className="fixora-conversation-card__unread-dot" />
								)}
							</div>

							{/* Content */}
							<div className="fixora-conversation-card__content">
								<div className="fixora-conversation-card__name">
									{conversation.customerName}
								</div>
								<div className="fixora-conversation-card__message">
									{conversation.lastMessage.length > 40
										? `${conversation.lastMessage.substring(0, 40)}...`
										: conversation.lastMessage}
								</div>
							</div>

							{/* Time */}
							<div className="fixora-conversation-card__time">
								{conversation.timestamp}
							</div>

							{/* Status */}
							{conversation.status && (
								<div className="fixora-conversation-card__status">
									{conversation.status === 'in-progress' && (
										<span className="fixora-status-badge fixora-status-badge--active">
											In Progress
										</span>
									)}
									{conversation.status === 'completed' && (
										<span className="fixora-status-badge fixora-status-badge--completed">
											Completed
										</span>
									)}
								</div>
							)}
						</div>
					))
				) : (
					<div className="fixora-conversations__empty">
						<p>No conversations yet</p>
					</div>
				)}
			</div>

			{/* View All */}
			<button className="fixora-conversations__view-all">
				View all chats
			</button>
		</div>
	);
};

export default ConversationList;
