import React, { useState } from 'react';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';
import NotificationsList from '../../../libs/components/technician/NotificationsList';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	},
});

interface Notification {
	id: string;
	type: 'request' | 'message' | 'review' | 'payment';
	title: string;
	description: string;
	timestamp: string;
	isRead: boolean;
	icon: string;
}

const Notifications: NextPage = () => {
	const [notifications, setNotifications] = useState<Notification[]>([
		{
			id: '1',
			type: 'request',
			title: 'New request: iPhone 13 Screen Repair',
			description:
				'John D. requested a screen repair for iPhone 13. Price: $35',
			timestamp: 'Today 10:30 AM',
			isRead: false,
			icon: '🔔',
		},
		{
			id: '2',
			type: 'message',
			title: 'John D. accepted your offer',
			description:
				'The customer accepted your service offer for screen repair.',
			timestamp: 'Today 10:45 AM',
			isRead: false,
			icon: '💬',
		},
		{
			id: '3',
			type: 'request',
			title: 'New request: MacBook Air Overheating',
			description:
				'Sarah L. requested thermal paste replacement. Price: $60',
			timestamp: 'Today 02:00 PM',
			isRead: false,
			icon: '🔔',
		},
		{
			id: '4',
			type: 'review',
			title: 'You received a 5-star review',
			description:
				'John D. left a review: "Great work on the repair! Highly recommended."',
			timestamp: 'Yesterday 08:15 PM',
			isRead: true,
			icon: '⭐',
		},
		{
			id: '5',
			type: 'payment',
			title: 'Payment received',
			description:
				'Payment of $35 received for iPhone 13 screen repair from John D.',
			timestamp: 'Yesterday 08:30 PM',
			isRead: true,
			icon: '💰',
		},
		{
			id: '6',
			type: 'message',
			title: 'Sarah L. sent you a message',
			description: 'The MacBook is running much better now. Thanks!',
			timestamp: 'May 17, 03:00 PM',
			isRead: true,
			icon: '💬',
		},
		{
			id: '7',
			type: 'request',
			title: 'New request: iPad Battery Issue',
			description:
				'Michael K. requested battery replacement. Price: $25',
			timestamp: 'May 16, 05:30 PM',
			isRead: true,
			icon: '🔔',
		},
	]);

	const handleMarkAsRead = (id: string) => {
		setNotifications((prev) =>
			prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
		);
	};

	const handleMarkAllAsRead = () => {
		setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
	};

	const handleDelete = (id: string) => {
		setNotifications((prev) => prev.filter((n) => n.id !== id));
	};

	return (
		<div className="fixora-technician-notifications-page">
			<NotificationsList
				notifications={notifications}
				onMarkAsRead={handleMarkAsRead}
				onMarkAllAsRead={handleMarkAllAsRead}
				onDelete={handleDelete}
			/>
		</div>
	);
};

export default withTechnicianLayout(Notifications);
