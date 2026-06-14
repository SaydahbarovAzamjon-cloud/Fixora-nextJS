import React, { useState } from 'react';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';
import ConversationList from '../../../libs/components/technician/ConversationList';
import MessageThread from '../../../libs/components/technician/MessageThread';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	},
});

interface Conversation {
	id: string;
	customerName: string;
	lastMessage: string;
	timestamp: string;
	isUnread: boolean;
	status?: string;
}

interface Message {
	id: string;
	senderType: 'technician' | 'customer';
	content: string;
	timestamp: string;
}

const Messages: NextPage = () => {
	const [selectedConversationId, setSelectedConversationId] = useState<
		string | undefined
	>();

	// Mock conversations
	const mockConversations: Conversation[] = [
		{
			id: '1',
			customerName: 'John D.',
			lastMessage:
				'Hi! I have an issue with my iPhone 13 screen. Can you help?',
			timestamp: 'Today 10:30 AM',
			isUnread: true,
			status: 'in-progress',
		},
		{
			id: '2',
			customerName: 'Sarah L.',
			lastMessage:
				'The MacBook is running much better now. Thanks for the quick fix!',
			timestamp: 'Today 02:00 PM',
			isUnread: false,
			status: 'completed',
		},
		{
			id: '3',
			customerName: 'Michael K.',
			lastMessage: 'When can you deliver the iPad?',
			timestamp: 'Yesterday 04:30 PM',
			isUnread: false,
		},
		{
			id: '4',
			customerName: 'David E.',
			lastMessage: 'Great work on the repair! Highly recommended.',
			timestamp: 'Yesterday 08:15 PM',
			isUnread: false,
		},
		{
			id: '5',
			customerName: 'Emma W.',
			lastMessage: "I'll bring my watch tomorrow at 3 PM.",
			timestamp: 'May 15, 03:00 PM',
			isUnread: false,
		},
	];

	// Mock messages for selected conversation
	const mockMessages: Message[] = [
		{
			id: '1',
			senderType: 'customer',
			content: 'Hi! I have an issue with my iPhone 13 screen.',
			timestamp: '10:30 AM',
		},
		{
			id: '2',
			senderType: 'customer',
			content: 'Can you help me with it?',
			timestamp: '10:31 AM',
		},
		{
			id: '3',
			senderType: 'technician',
			content:
				'Hi! Yes, I can help. Can you describe what happened to your screen?',
			timestamp: '10:35 AM',
		},
		{
			id: '4',
			senderType: 'customer',
			content: 'The screen has cracks on the top left corner.',
			timestamp: '10:36 AM',
		},
		{
			id: '5',
			senderType: 'technician',
			content: 'I can fix that. The cost would be around $35.',
			timestamp: '10:40 AM',
		},
		{
			id: '6',
			senderType: 'customer',
			content: 'Great! When can you do it?',
			timestamp: '10:42 AM',
		},
		{
			id: '7',
			senderType: 'technician',
			content: 'I can do it today at 2 PM if that works for you.',
			timestamp: '10:45 AM',
		},
	];

	const selectedConversation = mockConversations.find(
		(c) => c.id === selectedConversationId
	);

	return (
		<div className="fixora-technician-messages-page">
			<div className="fixora-messages-container">
				{/* Left Pane - Conversations */}
				<div className="fixora-messages-left">
					<ConversationList
						conversations={mockConversations}
						selectedId={selectedConversationId}
						onSelectConversation={setSelectedConversationId}
					/>
				</div>

				{/* Right Pane - Message Thread */}
				<div className="fixora-messages-right">
					<MessageThread
						conversationId={selectedConversationId}
						customerName={selectedConversation?.customerName}
						messages={selectedConversationId ? mockMessages : []}
						bookingStatus={selectedConversation?.status}
						requestPrice={35}
						onSendMessage={(message) => {
							console.log('Sending message:', message);
						}}
					/>
				</div>
			</div>
		</div>
	);
};

export default withTechnicianLayout(Messages);
