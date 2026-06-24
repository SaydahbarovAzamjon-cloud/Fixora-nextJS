import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import AutorenewOutlinedIcon from '@mui/icons-material/AutorenewOutlined';
import HourglassTopOutlinedIcon from '@mui/icons-material/HourglassTopOutlined';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ModeCommentOutlinedIcon from '@mui/icons-material/ModeCommentOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { BookingStatus, Notification } from '../types/fixora/fixora';
import { ownerMyPageHref } from './clientMyPageRoute';

export type NotificationVisualKind =
	| 'BOOKING_REQUEST'
	| 'BOOKING_ACCEPTED'
	| 'BOOKING_REJECTED'
	| 'BOOKING_COMPLETED'
	| 'BOOKING_CANCELLED'
	| 'BOOKING_IN_PROGRESS'
	| 'BOOKING_STATUS'
	| 'BOOKING_PAYMENT'
	| 'NEW_MESSAGE'
	| 'NEW_FOLLOWER'
	| 'PROFILE_LIKE'
	| 'ARTICLE_LIKE'
	| 'COMMENT_LIKE'
	| 'NEW_COMMENT'
	| 'NEW_REVIEW'
	| 'ADMIN'
	| 'ADMIN_WARNING';

export interface NotificationVisualMeta {
	Icon: React.ElementType;
	tone: string;
}

export const NOTIFICATION_VISUAL_META: Record<NotificationVisualKind, NotificationVisualMeta> = {
	BOOKING_REQUEST: { Icon: HourglassTopOutlinedIcon, tone: 'pending' },
	BOOKING_ACCEPTED: { Icon: CheckCircleOutlineIcon, tone: 'accepted' },
	BOOKING_REJECTED: { Icon: CancelOutlinedIcon, tone: 'rejected' },
	BOOKING_COMPLETED: { Icon: TaskAltOutlinedIcon, tone: 'completed' },
	BOOKING_CANCELLED: { Icon: BlockOutlinedIcon, tone: 'cancelled' },
	BOOKING_IN_PROGRESS: { Icon: AutorenewOutlinedIcon, tone: 'progress' },
	BOOKING_STATUS: { Icon: BuildOutlinedIcon, tone: 'booking' },
	BOOKING_PAYMENT: { Icon: PaidOutlinedIcon, tone: 'payment' },
	NEW_MESSAGE: { Icon: ChatBubbleOutlineIcon, tone: 'message' },
	NEW_FOLLOWER: { Icon: PersonAddOutlinedIcon, tone: 'follow' },
	PROFILE_LIKE: { Icon: WorkspacePremiumOutlinedIcon, tone: 'like' },
	ARTICLE_LIKE: { Icon: FavoriteBorderOutlinedIcon, tone: 'like' },
	COMMENT_LIKE: { Icon: ThumbUpOutlinedIcon, tone: 'like' },
	NEW_COMMENT: { Icon: ModeCommentOutlinedIcon, tone: 'comment' },
	NEW_REVIEW: { Icon: StarOutlineIcon, tone: 'review' },
	ADMIN: { Icon: CampaignOutlinedIcon, tone: 'admin' },
	ADMIN_WARNING: { Icon: WarningAmberOutlinedIcon, tone: 'warning' },
};

/** @deprecated use getNotificationVisualKind */
export type NotificationCategory = NotificationVisualKind;

/** @deprecated use NOTIFICATION_VISUAL_META */
export const NOTIFICATION_CATEGORY_ICONS = Object.fromEntries(
	Object.entries(NOTIFICATION_VISUAL_META).map(([key, meta]) => [key, meta.Icon]),
) as Record<NotificationVisualKind, React.ElementType>;

const notificationTextBlob = (notification: Notification) =>
	`${notification.notificationTitle ?? ''} ${notification.notificationDescription ?? ''}`.toLowerCase();

const PAYMENT_PATTERN = /payment|paid|payout|earnings|deposit|final|kakao|kakaopay|결제|입금|보증금|잔금/i;
const BOOKING_REQUEST_PATTERN = /request|requested|new booking|submitted|so'rov|so‘rov|pending/i;
const REJECTED_PATTERN = /reject|declin|rad et|거부/i;
const ACCEPTED_PATTERN = /accept|qabul|수락|approved/i;
const COMPLETED_PATTERN = /complet|tugat|완료|finished|pickup|ready for/i;
const CANCELLED_PATTERN = /cancel|bekor|취소/i;
const IN_PROGRESS_PATTERN = /in progress|progress|started|jarayon|진행/i;
const ADMIN_WARNING_TITLE_PATTERN = /account warning|official warning|admin warning|계정 경고|공식 경고/i;

export const isAdminWarningNotification = (notification: Notification): boolean => {
	const title = (notification.notificationTitle ?? '').trim();
	if (!title) return false;
	if (ADMIN_WARNING_TITLE_PATTERN.test(title)) return true;
	return /\bwarning\b/i.test(title);
};

export const detectBookingStatusFromText = (notification: Notification): BookingStatus | null => {
	const text = notificationTextBlob(notification);
	if (REJECTED_PATTERN.test(text)) return 'REJECTED';
	if (ACCEPTED_PATTERN.test(text)) return 'ACCEPTED';
	if (COMPLETED_PATTERN.test(text)) return 'COMPLETED';
	if (CANCELLED_PATTERN.test(text)) return 'CANCELLED';
	if (IN_PROGRESS_PATTERN.test(text)) return 'IN_PROGRESS';
	if (BOOKING_REQUEST_PATTERN.test(text)) return 'PENDING';
	return null;
};

const mapBookingStatusToKind = (status: BookingStatus): NotificationVisualKind => {
	switch (status) {
		case 'ACCEPTED':
			return 'BOOKING_ACCEPTED';
		case 'REJECTED':
			return 'BOOKING_REJECTED';
		case 'COMPLETED':
			return 'BOOKING_COMPLETED';
		case 'CANCELLED':
			return 'BOOKING_CANCELLED';
		case 'IN_PROGRESS':
			return 'BOOKING_IN_PROGRESS';
		case 'PENDING':
			return 'BOOKING_REQUEST';
		default:
			return 'BOOKING_STATUS';
	}
};

export const getNotificationVisualKind = (
	notification: Notification,
	bookingStatus?: BookingStatus | null,
): NotificationVisualKind => {
	if (isAdminWarningNotification(notification)) {
		return 'ADMIN_WARNING';
	}

	const text = notificationTextBlob(notification);

	switch (notification.notificationType) {
		case 'MESSAGE':
			return 'NEW_MESSAGE';
		case 'FOLLOW':
			return 'NEW_FOLLOWER';
		case 'COMMENT':
			return 'NEW_COMMENT';
		case 'REVIEW':
			return 'NEW_REVIEW';
		case 'LIKE':
			if (notification.referenceType === 'ARTICLE') return 'ARTICLE_LIKE';
			if (notification.referenceType === 'REVIEW') return 'COMMENT_LIKE';
			return 'PROFILE_LIKE';
		case 'BOOKING': {
			if (PAYMENT_PATTERN.test(text)) return 'BOOKING_PAYMENT';
			const fromText = detectBookingStatusFromText(notification);
			if (fromText) return mapBookingStatusToKind(fromText);
			if (bookingStatus) return mapBookingStatusToKind(bookingStatus);
			if (BOOKING_REQUEST_PATTERN.test(text)) return 'BOOKING_REQUEST';
			return 'BOOKING_STATUS';
		}
		default:
			if (PAYMENT_PATTERN.test(text)) return 'BOOKING_PAYMENT';
			return 'ADMIN';
	}
};

/** @deprecated use getNotificationVisualKind */
export const getNotificationCategory = (notification: Notification): NotificationVisualKind =>
	getNotificationVisualKind(notification);

const BOOKING_I18N_KEYS: Partial<Record<NotificationVisualKind, string>> = {
	BOOKING_REQUEST: 'notifications.booking.pending',
	BOOKING_ACCEPTED: 'notifications.booking.accepted',
	BOOKING_REJECTED: 'notifications.booking.rejected',
	BOOKING_COMPLETED: 'notifications.booking.completed',
	BOOKING_CANCELLED: 'notifications.booking.cancelled',
	BOOKING_IN_PROGRESS: 'notifications.booking.inProgress',
	BOOKING_STATUS: 'notifications.booking.updated',
	BOOKING_PAYMENT: 'notifications.booking.payment',
};

export const getNotificationProblemLabel = (notification: Notification) =>
	notification.notificationDescription?.trim() ||
	notification.notificationTitle?.trim() ||
	'';

export const getNotificationDisplayText = (
	notification: Notification,
	kind: NotificationVisualKind,
	t: (key: string, options?: Record<string, string>) => string,
): string => {
	if (kind === 'ADMIN_WARNING') {
		return notification.notificationDescription?.trim() || notification.notificationTitle?.trim() || '';
	}

	if (notification.notificationType === 'MESSAGE') {
		return t('notifications.types.message');
	}

	const problem = getNotificationProblemLabel(notification);
	const bookingKey = BOOKING_I18N_KEYS[kind];
	if (bookingKey) {
		return t(bookingKey, { problem });
	}

	switch (kind) {
		case 'NEW_REVIEW':
			return t('notifications.review.new', { problem });
		case 'NEW_FOLLOWER':
			return t('notifications.follow.new');
		case 'NEW_COMMENT':
			return t('notifications.comment.new', { problem });
		case 'ARTICLE_LIKE':
			return t('notifications.like.article');
		case 'COMMENT_LIKE':
			return t('notifications.like.comment');
		case 'PROFILE_LIKE':
			return t('notifications.like.profile');
		default:
			return problem || notification.notificationTitle;
	}
};

/** @deprecated use getNotificationDisplayText with kind */
export const getNotificationText = (notification: Notification, t: (key: string) => string): string =>
	getNotificationDisplayText(notification, getNotificationVisualKind(notification), t);

export const shouldShowNotificationSender = (notification: Notification) =>
	isAdminWarningNotification(notification) ||
	['BOOKING', 'REVIEW', 'FOLLOW', 'LIKE', 'COMMENT'].includes(notification.notificationType);

/** Customer bell/page: booking flow only — no like/follow/comment/review/message. */
export const isCustomerNotification = (notification: Notification) => notification.notificationType === 'BOOKING';

export const filterCustomerNotifications = (notifications: Notification[]) =>
	notifications.filter(isCustomerNotification);

export const filterNavbarNotifications = (notifications: Notification[], isTechnician: boolean) => {
	const withoutMessages = notifications.filter((n) => n.notificationType !== 'MESSAGE');
	return isTechnician ? withoutMessages : filterCustomerNotifications(withoutMessages);
};

export const getNotificationLink = (notification: Notification): string | null => {
	switch (notification.referenceType) {
		case 'BOOKING':
			return notification.referenceId
				? `/mypage/bookings/${notification.referenceId}`
				: ownerMyPageHref('activeRequests');
		case 'MESSAGE':
			return '/messages';
		case 'ARTICLE':
			return notification.referenceId ? `/community/${notification.referenceId}` : '/community';
		case 'REVIEW':
			return ownerMyPageHref('activeRequests');
		default:
			return null;
	}
};
