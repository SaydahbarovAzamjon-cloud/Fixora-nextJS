import React, { useMemo, useState } from 'react';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import MoveToInboxOutlined from '@mui/icons-material/MoveToInboxOutlined';
import ChatBubbleOutlineOutlined from '@mui/icons-material/ChatBubbleOutlineOutlined';
import AttachMoneyOutlined from '@mui/icons-material/AttachMoneyOutlined';
import StarRounded from '@mui/icons-material/StarRounded';
import ErrorOutlineOutlined from '@mui/icons-material/ErrorOutlineOutlined';
import DoneAllRounded from '@mui/icons-material/DoneAllRounded';
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';
import { GET_NOTIFICATIONS, MARK_ALL_NOTIFICATIONS_READ, MARK_NOTIFICATION_READ } from '../../../apollo/user/notification';
import { userVar } from '../../../apollo/store';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: { ...(await serverSideTranslations(locale ?? 'en', ['common'])) },
});

type NotifKind = 'requests' | 'messages' | 'payments' | 'reviews' | 'alerts';

const KIND_META: Record<NotifKind, { gradient: string; color: string; icon: React.ReactNode }> = {
	requests: {
		gradient: 'linear-gradient(135deg, #FF5A5A, #FF9A3C)',
		color: '#FF6B00',
		icon: <MoveToInboxOutlined style={{ fontSize: 22, color: '#fff' }} />,
	},
	messages: {
		gradient: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
		color: '#A855F7',
		icon: <ChatBubbleOutlineOutlined style={{ fontSize: 21, color: '#fff' }} />,
	},
	payments: {
		gradient: 'linear-gradient(135deg, #22C55E, #16A34A)',
		color: '#22C55E',
		icon: <AttachMoneyOutlined style={{ fontSize: 22, color: '#fff' }} />,
	},
	reviews: {
		gradient: 'linear-gradient(135deg, #F59E0B, #FACC15)',
		color: '#F59E0B',
		icon: <StarRounded style={{ fontSize: 22, color: '#fff' }} />,
	},
	alerts: {
		gradient: 'linear-gradient(135deg, #EC4899, #D946EF)',
		color: '#EC4899',
		icon: <ErrorOutlineOutlined style={{ fontSize: 22, color: '#fff' }} />,
	},
};

const FILTERS: { id: 'all' | NotifKind; label: string }[] = [
	{ id: 'all', label: 'All' },
	{ id: 'requests', label: 'Requests' },
	{ id: 'messages', label: 'Messages' },
	{ id: 'payments', label: 'Payments' },
	{ id: 'reviews', label: 'Reviews' },
	{ id: 'alerts', label: 'Alerts' },
];

const mapKind = (notificationType?: string): NotifKind => {
	const t = (notificationType ?? '').toUpperCase();
	if (t.includes('BOOKING') || t.includes('REQUEST')) return 'requests';
	if (t.includes('MESSAGE')) return 'messages';
	if (t.includes('PAYMENT')) return 'payments';
	if (t.includes('REVIEW')) return 'reviews';
	return 'alerts';
};

const timeAgo = (dateStr?: string | null) => {
	if (!dateStr) return '';
	const diff = Date.now() - new Date(dateStr).getTime();
	const m = Math.floor(diff / 60000);
	if (m < 1) return 'just now';
	if (m < 60) return `${m} min ago`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h}h ago`;
	const d = Math.floor(h / 24);
	if (d < 7) return `${d}d ago`;
	return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const Notifications: NextPage = () => {
	const user = useReactiveVar(userVar);
	const [activeFilter, setActiveFilter] = useState<'all' | NotifKind>('all');

	const { data, loading, refetch } = useQuery(GET_NOTIFICATIONS, {
		skip: !user?._id,
		variables: { input: { page: 1, limit: 50, search: {} } },
		fetchPolicy: 'network-only',
	});

	const [markRead] = useMutation(MARK_NOTIFICATION_READ);
	const [markAllRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ);

	const notifications = useMemo(() => data?.getNotifications?.list ?? [], [data]);

	const unreadCount = useMemo(() => notifications.filter((n: any) => !n.isRead).length, [notifications]);

	const filtered = useMemo(() => {
		const list = notifications.filter((n: any) => n.notificationType !== 'MESSAGE');
		if (activeFilter === 'all') return list;
		return list.filter((n: any) => mapKind(n.notificationType) === activeFilter);
	}, [notifications, activeFilter]);

	const handleMarkAllRead = async () => {
		await markAllRead();
		refetch();
	};

	const handleMarkRead = async (id: string) => {
		await markRead({ variables: { input: { notificationId: id } } });
		refetch();
	};

	return (
		<div className="fixora-notif-page">
			<div className="fixora-notif-header">
				<div>
					<div className="fixora-notif-header__title-row">
						<h2 className="fixora-notif-header__title">Notification Center</h2>
						{unreadCount > 0 && <span className="fixora-notif-header__badge">{unreadCount} new</span>}
					</div>
					<p className="fixora-notif-header__sub">Stay on top of your repair workflow</p>
				</div>
				{unreadCount > 0 && (
					<button className="fixora-notif-markall" onClick={handleMarkAllRead} type="button">
						<DoneAllRounded style={{ fontSize: 17 }} /> Mark all as read
					</button>
				)}
			</div>

			<div className="fixora-notif-filters">
				{FILTERS.map((f) => (
					<button
						key={f.id}
						className={`fixora-notif-filter ${activeFilter === f.id ? 'fixora-notif-filter--active' : ''}`}
						onClick={() => setActiveFilter(f.id)}
						type="button"
					>
						{f.label}
					</button>
				))}
			</div>

			<div className="fixora-notif-list">
				{loading ? (
					<div className="fixora-notif-loading">
						<div className="fixora-notif-loading__spinner" />
					</div>
				) : filtered.length === 0 ? (
					<div className="fixora-notif-empty">
						<NotificationsNoneOutlined style={{ fontSize: 48, color: '#333' }} />
						<p>You have no notifications</p>
					</div>
				) : (
					filtered.map((n: any) => {
						const kind = mapKind(n.notificationType);
						const meta = KIND_META[kind];
						return (
							<div
								key={n._id}
								className={`fixora-notif-card ${!n.isRead ? 'fixora-notif-card--unread' : ''}`}
								onClick={() => !n.isRead && handleMarkRead(n._id)}
							>
								<div className="fixora-notif-card__icon" style={{ background: meta.gradient }}>
									{meta.icon}
								</div>
								<div className="fixora-notif-card__body">
									<div className="fixora-notif-card__top">
										<div className="fixora-notif-card__title">{n.notificationTitle}</div>
										<div className="fixora-notif-card__time">{timeAgo(n.createdAt)}</div>
									</div>
									<div className="fixora-notif-card__desc">{n.notificationDescription}</div>
								</div>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
};

export default withTechnicianLayout(Notifications);
