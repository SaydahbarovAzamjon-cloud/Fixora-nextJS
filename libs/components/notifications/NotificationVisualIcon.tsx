import React from 'react';
import { BookingStatus, Notification } from '../../types/fixora/fixora';
import { NOTIFICATION_VISUAL_META, getNotificationVisualKind } from '../../utils/notifications';

interface NotificationVisualIconProps {
	notification: Notification;
	bookingStatus?: BookingStatus | null;
	className?: string;
}

const NotificationVisualIcon = ({
	notification,
	bookingStatus,
	className = 'fixora-notif-dropdown__icon',
}: NotificationVisualIconProps) => {
	const kind = getNotificationVisualKind(notification, bookingStatus);
	const { Icon, tone } = NOTIFICATION_VISUAL_META[kind];

	return (
		<span className={`${className} ${className}--${tone}`}>
			<Icon fontSize="small" />
		</span>
	);
};

export default NotificationVisualIcon;
