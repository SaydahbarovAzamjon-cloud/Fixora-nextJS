import React, { useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { technicianPageProps } from '../../../libs/i18n/technicianPageProps';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import MoveToInboxRounded from '@mui/icons-material/MoveToInboxRounded';
import Inventory2Rounded from '@mui/icons-material/Inventory2Rounded';
import FavoriteRounded from '@mui/icons-material/FavoriteRounded';
import PersonAddAlt1Rounded from '@mui/icons-material/PersonAddAlt1Rounded';
import StarRounded from '@mui/icons-material/StarRounded';
import ChatBubbleRounded from '@mui/icons-material/ChatBubbleRounded';
import PaidRounded from '@mui/icons-material/PaidRounded';
import CampaignRounded from '@mui/icons-material/CampaignRounded';
import WarningAmberRounded from '@mui/icons-material/WarningAmberRounded';
import DoneAllRounded from '@mui/icons-material/DoneAllRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';
import {
	DELETE_NOTIFICATION,
	GET_NOTIFICATIONS,
	MARK_ALL_NOTIFICATIONS_READ,
	MARK_NOTIFICATION_READ,
} from '../../../apollo/user/notification';
import { userVar } from '../../../apollo/store';
import NotificationSender from '../../../libs/components/notifications/NotificationSender';
import {
	getNotificationLink,
	isAdminWarningNotification,
} from '../../../libs/utils/notifications';
import { sweetErrorHandling } from '../../../libs/sweetAlert';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: await technicianPageProps(locale),
});

type NotifCat = 'request' | 'status' | 'review' | 'follow' | 'like' | 'comment' | 'message' | 'payment' | 'alert' | 'warning';
type FilterId = 'all' | 'requests' | 'payments' | 'reviews' | 'likes' | 'follows' | 'messages' | 'alerts';

interface CatMeta {
	gradient: string;
	color: string;
	icon: React.ReactNode;
	filter: Exclude<FilterId, 'all'>;
	action: (n: any) => { label: string; link: string } | null;
}

const ICON_SX = { fontSize: 20, color: '#fff' } as const;

const CAT_META: Record<NotifCat, CatMeta> = {
	request: {
		gradient: 'linear-gradient(135deg, #730c1e 0%, #8e1428 100%)',
		color: '#8e1428',
		icon: <MoveToInboxRounded style={ICON_SX} />,
		filter: 'requests',
		action: () => ({ label: 'View Request', link: '/technician/requests' }),
	},
	status: {
		gradient: 'linear-gradient(135deg, #7B2CFF 0%, #D500F9 100%)',
		color: '#A855F7',
		icon: <Inventory2Rounded style={ICON_SX} />,
		filter: 'requests',
		action: () => ({ label: 'View Job', link: '/technician/jobs' }),
	},
	review: {
		gradient: 'linear-gradient(135deg, #F59E0B 0%, #FACC15 100%)',
		color: '#F59E0B',
		icon: <StarRounded style={ICON_SX} />,
		filter: 'reviews',
		action: (n) => ({ label: 'View Review', link: n.userId ? `/technician/client/${n.userId}` : '/technician/profile' }),
	},
	follow: {
		gradient: 'linear-gradient(135deg, #35A8FF 0%, #3FE5FF 100%)',
		color: '#22D3EE',
		icon: <PersonAddAlt1Rounded style={ICON_SX} />,
		filter: 'follows',
		action: (n) => {
			const followerId = n.referenceId || n.userId;
			return { label: 'View Profile', link: followerId ? `/technician/client/${followerId}` : '/technician/profile' };
		},
	},
	like: {
		gradient: 'linear-gradient(135deg, #FF4FA3 0%, #C42EFF 100%)',
		color: '#EC4899',
		icon: <FavoriteRounded style={ICON_SX} />,
		filter: 'likes',
		action: (n) =>
			n.referenceType === 'ARTICLE'
				? { label: 'View Article', link: n.referenceId ? `/community/${n.referenceId}` : '/community' }
				: { label: 'View Profile', link: n.userId ? `/technician/client/${n.userId}` : '/technician/profile' },
	},
	comment: {
		gradient: 'linear-gradient(135deg, #7B2CFF 0%, #D500F9 100%)',
		color: '#A855F7',
		icon: <ChatBubbleRounded style={ICON_SX} />,
		filter: 'alerts',
		action: (n) => ({ label: 'View Article', link: n.referenceId ? `/community/${n.referenceId}` : '/community' }),
	},
	message: {
		gradient: 'linear-gradient(135deg, #35A8FF 0%, #3FE5FF 100%)',
		color: '#22D3EE',
		icon: <ChatBubbleRounded style={ICON_SX} />,
		filter: 'messages',
		action: (n) => {
			const link = getNotificationLink(n, { isTechnician: true });
			return link ? { label: 'Open Chat', link } : null;
		},
	},
	payment: {
		gradient: 'linear-gradient(135deg, #19D68C 0%, #3EE8A5 100%)',
		color: '#22C55E',
		icon: <PaidRounded style={ICON_SX} />,
		filter: 'payments',
		action: () => ({ label: 'View Earnings', link: '/technician/earnings' }),
	},
	alert: {
		gradient: 'linear-gradient(135deg, #FF4FA3 0%, #C42EFF 100%)',
		color: '#EC4899',
		icon: <CampaignRounded style={ICON_SX} />,
		filter: 'alerts',
		action: () => null,
	},
	warning: {
		gradient: 'linear-gradient(135deg, #F59E0B 0%, #FACC15 100%)',
		color: '#F59E0B',
		icon: <WarningAmberRounded style={ICON_SX} />,
		filter: 'alerts',
		action: () => null,
	},
};

const FILTER_KEYS: Record<FilterId, string> = {
	all: 'notifications.filterAll',
	requests: 'notifications.filterRequests',
	payments: 'notifications.filterPayments',
	reviews: 'notifications.filterReviews',
	likes: 'notifications.filterLikes',
	follows: 'notifications.filterFollows',
	messages: 'notifications.filterMessages',
	alerts: 'notifications.filterAlerts',
};

const BOOKING_REQUEST_PATTERN = /request|requested|new booking/i;

const detectCat = (n: any): NotifCat => {
	if (isAdminWarningNotification(n)) return 'warning';

	const type = (n.notificationType ?? '').toUpperCase();
	const text = `${n.notificationTitle ?? ''} ${n.notificationDescription ?? ''}`;
	switch (type) {
		case 'PAYMENT':
			return 'payment';
		case 'REVIEW':
			return 'review';
		case 'FOLLOW':
			return 'follow';
		case 'LIKE':
			return 'like';
		case 'COMMENT':
			return 'comment';
		case 'MESSAGE':
			return 'message';
		case 'BOOKING':
			return BOOKING_REQUEST_PATTERN.test(text) ? 'request' : 'status';
		default:
			return 'alert';
	}
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
	if (d === 1) {
		const t = new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric' });
		return `Yesterday, ${t}`;
	}
	if (d < 7) return `${d}d ago`;
	return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const isToday = (dateStr?: string | null) =>
	!!dateStr && new Date(dateStr).toDateString() === new Date().toDateString();

const NotifSender = ({ userId }: { userId?: string | null }) => (
	<NotificationSender userId={userId} />
);

const Notifications: NextPage = () => {
	const { t } = useTranslation('technician');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [activeFilter, setActiveFilter] = useState<FilterId>('all');

	const FILTERS: FilterId[] = ['all', 'requests', 'messages', 'payments', 'reviews', 'likes', 'follows'];

	const { data, loading, refetch } = useQuery(GET_NOTIFICATIONS, {
		skip: !user?._id,
		variables: { input: { page: 1, limit: 100, sort: 'createdAt', direction: 'DESC', search: {} } },
		fetchPolicy: 'network-only',
	});

	const [markRead] = useMutation(MARK_NOTIFICATION_READ);
	const [markAllRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ);
	const [deleteNotification] = useMutation(DELETE_NOTIFICATION);

	const notifications = useMemo(
		() =>
			(data?.getNotifications?.list ?? []).sort(
				(a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
			),
		[data],
	);

	const unreadCount = useMemo(() => notifications.filter((n: any) => !n.isRead).length, [notifications]);

	const filtered = useMemo(() => {
		if (activeFilter === 'all') return notifications;
		return notifications.filter((n: any) => CAT_META[detectCat(n)].filter === activeFilter);
	}, [notifications, activeFilter]);

	const { today, earlier } = useMemo(() => {
		const today: any[] = [];
		const earlier: any[] = [];
		filtered.forEach((n: any) => (isToday(n.createdAt) ? today : earlier).push(n));
		return { today, earlier };
	}, [filtered]);

	const handleMarkAllRead = async () => {
		await markAllRead();
		refetch();
	};

	const handleOpen = async (n: any) => {
		if (!n.isRead) {
			await markRead({ variables: { input: { notificationId: n._id } } });
			refetch();
		}
		const action = CAT_META[detectCat(n)].action(n);
		if (action) router.push(action.link);
	};

	const handleDelete = async (id: string) => {
		try {
			await deleteNotification({ variables: { notificationId: id } });
			await refetch();
		} catch (err: unknown) {
			await sweetErrorHandling(err);
		}
	};

	const renderCard = (n: any) => {
		const cat = detectCat(n);
		const meta = CAT_META[cat];
		const action = meta.action(n);
		const isIssue = cat === 'request' || cat === 'status';
		const isWarning = cat === 'warning';
		return (
			<div
				key={n._id}
				className={`fixora-notif-card ${!n.isRead ? 'fixora-notif-card--unread' : ''}${isWarning ? ' fixora-notif-card--warning' : ''}`}
				onClick={() => handleOpen(n)}
			>
				<div className="fixora-notif-card__icon" style={{ background: meta.gradient }}>
					{meta.icon}
				</div>
				<div className="fixora-notif-card__body">
					<div className="fixora-notif-card__title">{n.notificationTitle}</div>
					{isWarning ? (
						<>
							{n.userId && (
								<div className="fixora-notif-card__warning-from">
									<NotifSender userId={n.userId} />
								</div>
							)}
							{n.notificationDescription?.trim() && (
								<p className="fixora-notif-card__warning-message">{n.notificationDescription.trim()}</p>
							)}
							<div className="fixora-notif-card__meta fixora-notif-card__meta--inline">
								<span className="fixora-notif-card__time">{timeAgo(n.createdAt)}</span>
								<button
									type="button"
									className="fixora-notif-card__delete"
									title={t('notifications.delete')}
									onClick={(e) => {
										e.stopPropagation();
										handleDelete(n._id);
									}}
								>
									<CloseRounded style={{ fontSize: 15 }} />
								</button>
							</div>
						</>
					) : (
						<div className="fixora-notif-card__subrow">
							<NotifSender userId={n.userId} />
							{n.notificationDescription && (
								<span className={`fixora-notif-card__issue ${isIssue ? 'fixora-notif-card__issue--alert' : ''}`}>
									{n.notificationDescription}
								</span>
							)}
							<div className="fixora-notif-card__meta">
								<span className="fixora-notif-card__time">{timeAgo(n.createdAt)}</span>
								<button
									type="button"
									className="fixora-notif-card__delete"
									title={t('notifications.delete')}
									onClick={(e) => {
										e.stopPropagation();
										handleDelete(n._id);
									}}
								>
									<CloseRounded style={{ fontSize: 15 }} />
								</button>
							</div>
						</div>
					)}
					{action && (
						<button
							className="fixora-notif-card__action"
							style={{ ['--notif-action-color' as any]: meta.color, color: meta.color, borderColor: meta.color }}
							onClick={(e) => {
								e.stopPropagation();
								handleOpen(n);
							}}
							type="button"
						>
							{action.label}
						</button>
					)}
				</div>
			</div>
		);
	};

	return (
		<div className="fixora-notif-page">
			<div className="fixora-notif-header">
				<div>
					<div className="fixora-notif-header__title-row">
						<h2 className="fixora-notif-header__title">{t('notifications.title')}</h2>
						{unreadCount > 0 && <span className="fixora-notif-header__badge">{t('notifications.newBadge', { count: unreadCount })}</span>}
					</div>
					<p className="fixora-notif-header__sub">{t('notifications.subtitle')}</p>
				</div>
				{unreadCount > 0 && (
					<button className="fixora-notif-markall" onClick={handleMarkAllRead} type="button">
						<DoneAllRounded style={{ fontSize: 17 }} /> {t('notifications.markAllRead')}
					</button>
				)}
			</div>

			<div className="fixora-notif-filters">
				{FILTERS.map((f) => (
					<button
						key={f}
						className={`fixora-notif-filter ${activeFilter === f ? 'fixora-notif-filter--active' : ''}`}
						onClick={() => setActiveFilter(f)}
						type="button"
					>
						{t(FILTER_KEYS[f])}
					</button>
				))}
			</div>

			{loading ? (
				<div className="fixora-notif-loading">
					<div className="fixora-notif-loading__spinner" />
				</div>
			) : filtered.length === 0 ? (
				<div className="fixora-notif-empty">
					<NotificationsNoneOutlined style={{ fontSize: 48, color: '#333' }} />
					<p>{t('notifications.empty')}</p>
				</div>
			) : (
				<>
					{today.length > 0 && (
						<>
							<div className="fixora-notif-section-label">{t('notifications.today')}</div>
							<div className="fixora-notif-list">{today.map(renderCard)}</div>
						</>
					)}
					{earlier.length > 0 && (
						<>
							<div className="fixora-notif-section-label" style={{ marginTop: today.length > 0 ? 28 : 0 }}>
								{t('notifications.earlier')}
							</div>
							<div className="fixora-notif-list">{earlier.map(renderCard)}</div>
						</>
					)}
				</>
			)}
		</div>
	);
};

export default withTechnicianLayout(Notifications);
