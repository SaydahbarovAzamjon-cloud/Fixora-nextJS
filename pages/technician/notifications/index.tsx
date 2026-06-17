import React, { useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import MoveToInboxRounded from '@mui/icons-material/MoveToInboxRounded';
import Inventory2Rounded from '@mui/icons-material/Inventory2Rounded';
import FavoriteRounded from '@mui/icons-material/FavoriteRounded';
import PersonAddAlt1Rounded from '@mui/icons-material/PersonAddAlt1Rounded';
import StarRounded from '@mui/icons-material/StarRounded';
import ChatBubbleRounded from '@mui/icons-material/ChatBubbleRounded';
import PaidRounded from '@mui/icons-material/PaidRounded';
import CampaignRounded from '@mui/icons-material/CampaignRounded';
import DoneAllRounded from '@mui/icons-material/DoneAllRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import NotificationsNoneOutlined from '@mui/icons-material/NotificationsNoneOutlined';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';
import { GET_NOTIFICATIONS, MARK_ALL_NOTIFICATIONS_READ, MARK_NOTIFICATION_READ } from '../../../apollo/user/notification';
import { GET_USER } from '../../../apollo/user/query';
import { userVar } from '../../../apollo/store';
import { resolveProfileImageUrl } from '../../../libs/utils/profileImage';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: { ...(await serverSideTranslations(locale ?? 'en', ['common'])) },
});

type NotifCat = 'request' | 'status' | 'review' | 'follow' | 'like' | 'comment' | 'payment' | 'alert';
type FilterId = 'all' | 'requests' | 'payments' | 'reviews' | 'likes' | 'follows' | 'alerts';

interface CatMeta {
	gradient: string;
	color: string;
	icon: React.ReactNode;
	filter: Exclude<FilterId, 'all'>;
	action: (n: any) => { label: string; link: string } | null;
}

const ICON_SX = { fontSize: 22, color: '#fff' } as const;

const CAT_META: Record<NotifCat, CatMeta> = {
	request: {
		gradient: 'linear-gradient(135deg, #FF6B00, #FF9A3C)',
		color: '#FF6B00',
		icon: <MoveToInboxRounded style={ICON_SX} />,
		filter: 'requests',
		action: () => ({ label: 'View Request', link: '/technician/requests' }),
	},
	status: {
		gradient: 'linear-gradient(135deg, #A855F7, #8B5CF6)',
		color: '#A855F7',
		icon: <Inventory2Rounded style={ICON_SX} />,
		filter: 'requests',
		action: () => ({ label: 'View Job', link: '/technician/jobs' }),
	},
	review: {
		gradient: 'linear-gradient(135deg, #F59E0B, #FACC15)',
		color: '#F59E0B',
		icon: <StarRounded style={ICON_SX} />,
		filter: 'reviews',
		action: () => ({ label: 'View Review', link: '/technician/profile' }),
	},
	follow: {
		gradient: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
		color: '#22D3EE',
		icon: <PersonAddAlt1Rounded style={ICON_SX} />,
		filter: 'follows',
		action: () => ({ label: 'View Profile', link: '/technician/profile' }),
	},
	like: {
		gradient: 'linear-gradient(135deg, #EC4899, #F43F5E)',
		color: '#EC4899',
		icon: <FavoriteRounded style={ICON_SX} />,
		filter: 'likes',
		action: (n) =>
			n.referenceType === 'ARTICLE'
				? { label: 'View Article', link: n.referenceId ? `/community/${n.referenceId}` : '/community' }
				: { label: 'View Profile', link: '/technician/profile' },
	},
	comment: {
		gradient: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
		color: '#A855F7',
		icon: <ChatBubbleRounded style={ICON_SX} />,
		filter: 'alerts',
		action: (n) => ({ label: 'View Article', link: n.referenceId ? `/community/${n.referenceId}` : '/community' }),
	},
	payment: {
		gradient: 'linear-gradient(135deg, #22C55E, #16A34A)',
		color: '#22C55E',
		icon: <PaidRounded style={ICON_SX} />,
		filter: 'payments',
		action: () => ({ label: 'View Earnings', link: '/technician/earnings' }),
	},
	alert: {
		gradient: 'linear-gradient(135deg, #EC4899, #D946EF)',
		color: '#EC4899',
		icon: <CampaignRounded style={ICON_SX} />,
		filter: 'alerts',
		action: () => null,
	},
};

const FILTERS: { id: FilterId; label: string }[] = [
	{ id: 'all', label: 'All' },
	{ id: 'requests', label: 'Requests' },
	{ id: 'payments', label: 'Payments' },
	{ id: 'reviews', label: 'Reviews' },
	{ id: 'likes', label: 'Likes' },
	{ id: 'follows', label: 'Follows' },
];

const BOOKING_REQUEST_PATTERN = /request|requested|new booking/i;
const PAYMENT_PATTERN = /payment|paid|payout|earnings/i;

/** Derive the display category from real DB fields (notificationType + referenceType + text). */
const detectCat = (n: any): NotifCat => {
	const type = (n.notificationType ?? '').toUpperCase();
	const text = `${n.notificationTitle ?? ''} ${n.notificationDescription ?? ''}`;
	switch (type) {
		case 'REVIEW':
			return 'review';
		case 'FOLLOW':
			return 'follow';
		case 'LIKE':
			return 'like';
		case 'COMMENT':
			return 'comment';
		case 'BOOKING':
			if (PAYMENT_PATTERN.test(text)) return 'payment';
			return BOOKING_REQUEST_PATTERN.test(text) ? 'request' : 'status';
		default:
			if (PAYMENT_PATTERN.test(text)) return 'payment';
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

const initialsOf = (name: string) => {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return 'U';
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[1][0]).toUpperCase();
};

/** Shows the sender's avatar + nickname (fetched by userId) linking to their profile. */
const NotifSender = ({ userId }: { userId?: string | null }) => {
	const router = useRouter();
	const { data } = useQuery(GET_USER, {
		skip: !userId,
		variables: { userId },
		fetchPolicy: 'cache-first',
	});
	const sender = data?.getUser;
	if (!userId || !sender) return null;
	const name = sender.userNickname || sender.userFullName || sender.shopName || 'User';
	const img = sender.userProfileImage;
	const goProfile = (e: React.MouseEvent) => {
		e.stopPropagation();
		router.push(`/member?memberId=${userId}`);
	};
	return (
		<div className="fixora-notif-card__sender-row" onClick={goProfile}>
			<div className="fixora-notif-card__avatar">
				{img && img.trim() !== '' ? <img src={resolveProfileImageUrl(img)} alt={name} /> : initialsOf(name)}
			</div>
			<button type="button" className="fixora-notif-card__sender" onClick={goProfile}>
				{name}
			</button>
		</div>
	);
};

const Notifications: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [activeFilter, setActiveFilter] = useState<FilterId>('all');
	const [dismissed, setDismissed] = useState<Set<string>>(new Set());

	const { data, loading, refetch } = useQuery(GET_NOTIFICATIONS, {
		skip: !user?._id,
		variables: { input: { page: 1, limit: 100, sort: 'createdAt', direction: 'DESC', search: {} } },
		fetchPolicy: 'network-only',
	});

	const [markRead] = useMutation(MARK_NOTIFICATION_READ);
	const [markAllRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ);

	// Every notification except chat messages (those live in the Messages screen)
	// and any the user dismissed locally this session.
	const notifications = useMemo(
		() =>
			(data?.getNotifications?.list ?? []).filter(
				(n: any) => n.notificationType !== 'MESSAGE' && !dismissed.has(n._id)
			),
		[data, dismissed]
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

	// Backend has no deleteNotification mutation (see docs/schema.gql), so this
	// dismisses the card locally for the session. Wire a mutation here once it exists.
	const handleDelete = (id: string) => {
		setDismissed((prev) => new Set(prev).add(id));
	};

	const renderCard = (n: any) => {
		const meta = CAT_META[detectCat(n)];
		const action = meta.action(n);
		return (
			<div
				key={n._id}
				className={`fixora-notif-card ${!n.isRead ? 'fixora-notif-card--unread' : ''}`}
				onClick={() => handleOpen(n)}
			>
				<div className="fixora-notif-card__icon" style={{ background: meta.gradient }}>
					{meta.icon}
				</div>
				<div className="fixora-notif-card__body">
					<div className="fixora-notif-card__title">{n.notificationTitle}</div>
					<div className="fixora-notif-card__subrow">
						<NotifSender userId={n.userId} />
						{n.notificationDescription && (
							<span className="fixora-notif-card__issue">{n.notificationDescription}</span>
						)}
						<div className="fixora-notif-card__meta">
							<span className="fixora-notif-card__time">{timeAgo(n.createdAt)}</span>
							<button
								type="button"
								className="fixora-notif-card__delete"
								title="Delete notification"
								onClick={(e) => {
									e.stopPropagation();
									handleDelete(n._id);
								}}
							>
								<CloseRounded style={{ fontSize: 15 }} />
							</button>
						</div>
					</div>
					{action && (
						<button
							className="fixora-notif-card__action"
							style={{ color: meta.color, borderColor: meta.color }}
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
				<>
					{today.length > 0 && (
						<>
							<div className="fixora-notif-section-label">Today</div>
							<div className="fixora-notif-list">{today.map(renderCard)}</div>
						</>
					)}
					{earlier.length > 0 && (
						<>
							<div className="fixora-notif-section-label" style={{ marginTop: today.length > 0 ? 28 : 0 }}>
								Earlier
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
