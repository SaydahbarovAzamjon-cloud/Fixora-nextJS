import React, { useState, useRef, useEffect } from 'react';
import SendIcon from '@mui/icons-material/Send';

interface Message {
	id: string;
	senderType: 'technician' | 'customer';
	content: string;
	timestamp: string;
}

interface MessageThreadProps {
	conversationId?: string;
	customerName?: string;
	messages?: Message[];
	bookingStatus?: string;
	requestPrice?: number;
	startDate?: string;
	onSendMessage?: (message: string) => void;
}

const MessageThread: React.FC<MessageThreadProps> = ({
	conversationId,
	customerName,
	messages = [],
	bookingStatus,
	requestPrice,
	startDate,
	onSendMessage,
}) => {
	const [messageText, setMessageText] = useState('');
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const handleSendMessage = () => {
		if (messageText.trim()) {
			onSendMessage?.(messageText);
			setMessageText('');
		}
	};

	if (!conversationId) {
		return (
			<div className="fixora-message-thread fixora-message-thread--empty">
				<div className="fixora-message-thread__empty-state">
					<p>Select a conversation to start messaging</p>
				</div>
			</div>
		);
	}

	return (
		<div className="fixora-message-thread">
			{/* Header */}
			<div className="fixora-message-thread__header">
				<div>
					<h3 className="fixora-message-thread__title">{customerName || 'Customer'}</h3>
					<p className="fixora-message-thread__subtitle">
						Status: <strong>{bookingStatus || '—'}</strong>
					</p>
				</div>
				<a href="#" className="fixora-message-thread__view-request">
					View Request
				</a>
			</div>

			{/* Request Summary Bar */}
			<div className="fixora-message-thread__request-summary">
				{requestPrice !== undefined && (
					<div className="fixora-request-summary__item">
						<span className="fixora-request-summary__label">Price</span>
						<span className="fixora-request-summary__value">${requestPrice}</span>
					</div>
				)}
				{bookingStatus && (
					<div className="fixora-request-summary__item">
						<span className="fixora-request-summary__label">Status</span>
						<span className="fixora-request-summary__value">{bookingStatus}</span>
					</div>
				)}
				{startDate && (
					<div className="fixora-request-summary__item">
						<span className="fixora-request-summary__label">Start Date</span>
						<span className="fixora-request-summary__value">
							{new Date(startDate).toLocaleString('en-US', {
								month: 'short',
								day: 'numeric',
								hour: '2-digit',
								minute: '2-digit',
							})}
						</span>
					</div>
				)}
			</div>

			{/* Messages List */}
			<div className="fixora-message-thread__messages">
				{messages.length > 0 ? (
					messages.map((msg) => (
						<div
							key={msg.id}
							className={`fixora-message ${
								msg.senderType === 'technician'
									? 'fixora-message--sent'
									: 'fixora-message--received'
							}`}
						>
							<div className="fixora-message__content">
								{msg.content}
							</div>
							<div className="fixora-message__timestamp">
								{msg.timestamp}
							</div>
						</div>
					))
				) : (
					<div className="fixora-message-thread__no-messages">
						<p>No messages yet. Start a conversation!</p>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Message Input */}
			<div className="fixora-message-thread__input-area">
				<textarea
					className="fixora-message-thread__input"
					placeholder="Type a message..."
					value={messageText}
					onChange={(e) => setMessageText(e.target.value)}
					onKeyPress={(e) => {
						if (e.key === 'Enter' && !e.shiftKey) {
							e.preventDefault();
							handleSendMessage();
						}
					}}
				/>
				<button
					className="fixora-message-thread__send-btn"
					onClick={handleSendMessage}
					disabled={!messageText.trim()}
				>
					<SendIcon />
				</button>
			</div>
		</div>
	);
};

export default MessageThread;
