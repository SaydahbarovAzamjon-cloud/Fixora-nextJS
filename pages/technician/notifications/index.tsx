import React, { useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { technicianPageProps } from '../../../libs/i18n/technicianPageProps';
import { gql, useMutation, useQuery, useReactiveVar } from '@apollo/client';
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
import { GET_MY_PAYMENTS } from '../../../apollo/user/profile';
import { userVar } from '../../../apollo/store';
import NotificationSender from '../../../libs/components/notifications/NotificationSender';
import { formatKrw } from '../../../libs/utils/formatCurrency';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: await technicianPageProps(locale),
});

// Lightweight followers query — the shared GET_MEMBER_FOLLOWERS asks for legacy
// member* fields that don't exist on the Fixora `User` type, so we request only
// the User fields we actually need here.
const GET_FOLLOWERS_FOR_NOTIF = gql`
	query GetFollowersForNotif($input: FollowInquiry!) {
		getMemberFollowers(input: $input) {
			list {
				_id
				followerId
				createdAt
				followerData {
					_id
					userNickname
					userFullName
					userProfileImage
				}
			}
		}
	}
`;

type NotifCat = 'request' | 'status' | 'review' | 'follow' | 'like' | 'comment' | 'payment' | 'alert';
type FilterId = 'all' | 'requests' | 'payments' | 'reviews' | 'likes' | 'follows' | 'alerts';

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
		gradient: 'linear-gradient(135deg, #FF3D54 0%, #FF7A00 100%)',
		color: '#FF6B00',
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
		// The follower's id is stored on the notification (userId === referenceId === followerId).
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
};

const FILTER_KEYS: Record<FilterId, string> = {
	all: 'notifications.filterAll',
	requests: 'notifications.filterRequests',
	payments: 'notifications.filterPayments',
	reviews: 'notifications.filterReviews',
	likes: 'notifications.filterLikes',
	follows: 'notifications.filterFollows',
	alerts: 'notifications.filterAlerts',
};

const BOOKING_REQUEST_PATTERN = /request|requested|new booking/i;
const PAYMENT_PATTERN = /payment|paid|payout|earnings|deposit|final|kakao|kakaopay|결제|입금|보증금|잔금/i;
const FINAL_PAYMENT_PATTERN = /final|잔금/i;
const DEPOSIT_PAYMENT_PATTERN = /deposit|보증금/i;

const paymentKindFromText = (n: any): 'DEPOSIT' | 'FINAL' | 'ANY' => {
	const text = `${n.notificationTitle ?? ''} ${n.notificationDescription ?? ''}`;
	if (FINAL_PAYMENT_PATTERN.test(text)) return 'FINAL';
	if (DEPOSIT_PAYMENT_PATTERN.test(text)) return 'DEPOSIT';
	return 'ANY';
};

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

/** Shows the sender's avatar + nickname (fetched by userId) linking to their profile. */
const NotifSender = ({ userId }: { userId?: string | null }) => (
	<NotificationSender userId={userId} />
);

const Notifications: NextPage = () => {
	const { t } = useTranslation('technician');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [activeFilter, setActiveFilter] = useState<FilterId>('all');
	const [dismissed, setDismissed] = useState<Set<string>>(new Set());
	const dismissedStorageKey = user?._id ? `fixora_tech_dismissed_notifications_${user._id}` : null;

	const FILTERS: FilterId[] = ['all', 'requests', 'payments', 'reviews', 'likes', 'follows'];

	const { data, loading, refetch } = useQuery(GET_NOTIFICATIONS, {
		skip: !user?._id,
		variables: { input: { page: 1, limit: 100, sort: 'createdAt', direction: 'DESC', search: {} } },
		fetchPolicy: 'network-only',
	});

	// The backend only creates FOLLOW notification records for follows that happen
	// after that feature shipped, so older followers never appear in the feed. We
	// pull the technician's full followers list and surface every follower (old and
	// new) as a follow notification — this is the source of truth for "who followed".
	const { data: followersData } = useQuery(GET_FOLLOWERS_FOR_NOTIF, {
		skip: !user?._id,
		variables: { input: { page: 1, limit: 100, search: { followingId: user?._id } } },
		fetchPolicy: 'network-only',
	});
	const { data: paymentsData } = useQuery(GET_MY_PAYMENTS, {
		skip: !user?._id,
		variables: { input: { page: 1, limit: 100, search: {} } },
		fetchPolicy: 'network-only',
	});

	const [markRead] = useMutation(MARK_NOTIFICATION_READ);
	const [markAllRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ);

	useEffect(() => {
		if (!dismissedStorageKey || typeof window === 'undefined') return;
		try {
			const raw = window.localStorage.getItem(dismissedStorageKey);
			const ids = raw ? JSON.parse(raw) : [];
			setDismissed(new Set(Array.isArray(ids) ? ids : []));
		} catch {
			setDismissed(new Set());
		}
	}, [dismissedStorageKey]);

	// Turn each follower relationship into a synthetic follow notification.
	const followNotifications = useMemo(() => {
		const list = followersData?.getMemberFollowers?.list ?? [];
		return list.map((f: any) => {
			const fd = f.followerData ?? {};
			const followerId = fd._id || f.followerId;
			const name = fd.userNickname || fd.userFullName || 'Someone';
			return {
				_id: `follow-${f._id}`,
				userId: followerId,
				receiverId: user?._id,
				notificationType: 'FOLLOW',
				notificationTitle: t('notifications.newFollower'),
				notificationDescription: `${name} ${t('notifications.startedFollowing')}`,
				referenceId: followerId,
				referenceType: null,
				isRead: true,
				createdAt: f.createdAt,
			};
		});
	}, [followersData, user]);

	const realNotifications = useMemo(
		() =>
			(data?.getNotifications?.list ?? []).filter(
				(n: any) => n.notificationType !== 'MESSAGE' && n.notificationType !== 'FOLLOW',
			),
		[data],
	);

	const paymentNotifications = useMemo(() => {
		const payments = paymentsData?.getMyPayments?.list ?? [];
		const realPaymentKeys = new Set(
			realNotifications
				.filter((n: any) => detectCat(n) === 'payment' && n.referenceId)
				.map((n: any) => `${n.referenceId}-${paymentKindFromText(n)}`),
		);

		return payments
			.filter((p: any) => p.paymentType && (p.paymentStatus === 'COMPLETED' || p.paymentStatus === 'PENDING'))
			.filter((p: any) => {
				const exact = `${p.bookingId}-${p.paymentType}`;
				const any = `${p.bookingId}-ANY`;
				return !realPaymentKeys.has(exact) && !realPaymentKeys.has(any);
			})
			.map((p: any) => {
				const typeLabel = p.paymentType === 'DEPOSIT'
					? t('notifications.paymentTypeDeposit')
					: t('notifications.paymentTypeFinal');
				const statusLabel = p.paymentStatus === 'COMPLETED'
					? t('notifications.paymentStatusCompleted')
					: t('notifications.paymentStatusPending');
				return {
					_id: `payment-${p._id}`,
					userId: null,
					receiverId: user?._id,
					notificationType: 'BOOKING',
					notificationTitle: p.paymentType === 'DEPOSIT'
						? t('notifications.depositPaymentTitle')
						: t('notifications.finalPaymentTitle'),
					notificationDescription: t('notifications.paymentDescription', {
						type: typeLabel,
						status: statusLabel,
						amount: formatKrw(p.paymentAmount || 0),
					}),
					referenceId: p.bookingId,
					referenceType: 'BOOKING',
					isRead: true,
					createdAt: p.paidAt || p.createdAt,
				};
			});
	}, [paymentsData, realNotifications, t, user?._id]);

	// Real notifications (minus chat messages and real FOLLOW rows), merged with
	// derived follow/payment notifications and sorted.
	const notifications = useMemo(() => {
		return [...realNotifications, ...followNotifications, ...paymentNotifications]
			.filter((n: any) => !dismissed.has(n._id))
			.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
	}, [realNotifications, followNotifications, paymentNotifications, dismissed]);

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
	// persists a local dismiss per technician/browser. Wire a mutation once it exists.
	const handleDelete = (id: string) => {
		setDismissed((prev) => {
			const next = new Set(prev).add(id);
			if (dismissedStorageKey && typeof window !== 'undefined') {
				window.localStorage.setItem(dismissedStorageKey, JSON.stringify(Array.from(next)));
			}
			return next;
		});
	};

	const renderCard = (n: any) => {
		const cat = detectCat(n);
		const meta = CAT_META[cat];
		const action = meta.action(n);
		// Only repair-related notifications carry an "issue" (e.g. screen damage) shown in red.
		const isIssue = cat === 'request' || cat === 'status';
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
							<span className={`fixora-notif-card__issue ${isIssue ? 'fixora-notif-card__issue--alert' : ''}`}>
								{n.notificationDescription}
							</span>
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
