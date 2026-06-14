import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ModeCommentOutlinedIcon from '@mui/icons-material/ModeCommentOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import { Notification } from '../types/fixora/fixora';

/**
 * The product spec only recognizes these 9 notification categories
 * (Booking Requests / Booking Status Updates / New Messages / New Followers /
 * Profile Likes / Article Likes / Comment Likes / New Comments / Admin Notifications).
 * The backend `NotificationType` enum is coarser, so we derive the display
 * category from `notificationType` + `referenceType` (+ title heuristics for
 * booking request vs. status update).
 */
export type NotificationCategory =
	| 'BOOKING_REQUEST'
	| 'BOOKING_STATUS'
	| 'NEW_MESSAGE'
	| 'NEW_FOLLOWER'
	| 'PROFILE_LIKE'
	| 'ARTICLE_LIKE'
	| 'COMMENT_LIKE'
	| 'NEW_COMMENT'
	| 'ADMIN';

export const NOTIFICATION_CATEGORY_ICONS: Record<NotificationCategory, React.ElementType> = {
	BOOKING_REQUEST: BuildOutlinedIcon,
	BOOKING_STATUS: AssignmentTurnedInOutlinedIcon,
	NEW_MESSAGE: ChatBubbleOutlineIcon,
	NEW_FOLLOWER: PersonAddOutlinedIcon,
	PROFILE_LIKE: WorkspacePremiumOutlinedIcon,
	ARTICLE_LIKE: FavoriteBorderOutlinedIcon,
	COMMENT_LIKE: ThumbUpOutlinedIcon,
	NEW_COMMENT: ModeCommentOutlinedIcon,
	ADMIN: CampaignOutlinedIcon,
};

const BOOKING_REQUEST_PATTERN = /request|requested|new booking|so'rov|so‘rov/i;

export const getNotificationCategory = (notification: Notification): NotificationCategory => {
	switch (notification.notificationType) {
		case 'MESSAGE':
			return 'NEW_MESSAGE';
		case 'FOLLOW':
			return 'NEW_FOLLOWER';
		case 'COMMENT':
			return 'NEW_COMMENT';
		case 'LIKE':
			if (notification.referenceType === 'ARTICLE') return 'ARTICLE_LIKE';
			if (notification.referenceType === 'REVIEW') return 'COMMENT_LIKE';
			return 'PROFILE_LIKE';
		case 'BOOKING': {
			const text = `${notification.notificationTitle} ${notification.notificationDescription ?? ''}`;
			return BOOKING_REQUEST_PATTERN.test(text) ? 'BOOKING_REQUEST' : 'BOOKING_STATUS';
		}
		case 'REVIEW':
			return 'BOOKING_STATUS';
		default:
			return 'ADMIN';
	}
};

/** For MESSAGE notifications, show a generic line instead of the raw chat content */
export const getNotificationText = (notification: Notification, t: (key: string) => string): string => {
	if (notification.notificationType === 'MESSAGE') {
		return t('notifications.types.message');
	}
	return notification.notificationDescription || notification.notificationTitle;
};

export const getNotificationLink = (notification: Notification): string | null => {
	switch (notification.referenceType) {
		case 'BOOKING':
			return notification.referenceId ? `/messages?bookingId=${notification.referenceId}` : '/messages';
		case 'MESSAGE':
			return '/messages';
		case 'ARTICLE':
			return notification.referenceId ? `/community/${notification.referenceId}` : '/community';
		case 'REVIEW':
			return '/mypage';
		default:
			return null;
	}
};
