import React from 'react';
import Link from 'next/link';
import Moment from 'react-moment';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@apollo/client';
import { Notification } from '../../types/fixora/fixora';
import { GET_BOOKING } from '../../../apollo/user/query';
import {
	getNotificationDisplayText,
	getNotificationVisualKind,
	shouldShowNotificationSender,
} from '../../utils/notifications';
import NotificationVisualIcon from './NotificationVisualIcon';
import NotificationSender from './NotificationSender';

export interface NotificationDropdownProps {
	notifications: Notification[];
	onItemClick: (notification: Notification) => void;
	onViewAll: () => void;
	viewAllHref?: string;
}

const NotificationDropdownItem = ({
	notification,
	onClick,
}: {
	notification: Notification;
	onClick: () => void;
}) => {
	const { t } = useTranslation('common');
	const { data } = useQuery(GET_BOOKING, {
		skip: notification.referenceType !== 'BOOKING' || !notification.referenceId,
		variables: { bookingId: notification.referenceId! },
		fetchPolicy: 'cache-first',
	});

	const kind = getNotificationVisualKind(notification, data?.getBooking?.bookingStatus);
	const text = getNotificationDisplayText(notification, kind, t);
	const showSender = shouldShowNotificationSender(notification);

	return (
		<button
			type="button"
			className={`fixora-notif-dropdown__item ${!notification.isRead ? 'fixora-notif-dropdown__item--unread' : ''}`}
			onClick={onClick}
		>
			<NotificationVisualIcon notification={notification} bookingStatus={data?.getBooking?.bookingStatus} />
			<span className="fixora-notif-dropdown__body">
				{showSender && notification.userId && (
					<NotificationSender userId={notification.userId} className="fixora-notif-dropdown__sender" />
				)}
				<span className="fixora-notif-dropdown__text">{text}</span>
				<Moment fromNow className="fixora-notif-dropdown__time">
					{notification.createdAt}
				</Moment>
			</span>
			{!notification.isRead && <span className="fixora-notif-dropdown__dot" />}
		</button>
	);
};

const NotificationDropdown = ({
	notifications,
	onItemClick,
	onViewAll,
	viewAllHref = '/notifications',
}: NotificationDropdownProps) => {
	const { t } = useTranslation('common');

	return (
		<div className="fixora-notif-dropdown">
			<div className="fixora-notif-dropdown__header">
				<strong>{t('notifications.title')}</strong>
			</div>

			<div className="fixora-notif-dropdown__list">
				{notifications.length === 0 ? (
					<p className="fixora-notif-dropdown__empty">{t('notifications.empty')}</p>
				) : (
					notifications.map((notification) => (
						<NotificationDropdownItem
							key={notification._id}
							notification={notification}
							onClick={() => onItemClick(notification)}
						/>
					))
				)}
			</div>

			<Link href={viewAllHref} className="fixora-notif-dropdown__view-all" onClick={onViewAll}>
				{t('notifications.viewAll')}
			</Link>
		</div>
	);
};

export default NotificationDropdown;
