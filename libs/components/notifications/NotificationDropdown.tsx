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
	isAdminWarningNotification,
	shouldShowNotificationSender,
} from '../../utils/notifications';
import NotificationVisualIcon from './NotificationVisualIcon';
import NotificationSender from './NotificationSender';

export interface NotificationDropdownProps {
	notifications: Notification[];
	onItemClick: (notification: Notification) => void;
	onViewAll: () => void;
	onDelete?: (notification: Notification) => void;
	viewAllHref?: string;
	getDisplayText?: (notification: Notification) => string;
	skipBookingLookup?: (notification: Notification) => boolean;
	/** Extra rows rendered above API notifications (e.g. admin verification queue). */
	listPrefix?: React.ReactNode;
	/** Anchors below parent (admin bell) instead of navbar offsets. */
	embedded?: boolean;
	loading?: boolean;
	loadingLabel?: string;
	viewAllLabel?: string;
}

const NotificationDropdownItem = ({
	notification,
	onClick,
	onDelete,
	getDisplayText,
	skipBookingLookup,
}: {
	notification: Notification;
	onClick: () => void;
	onDelete?: () => void;
	getDisplayText?: (notification: Notification) => string;
	skipBookingLookup?: (notification: Notification) => boolean;
}) => {
	const { t } = useTranslation('common');
	const shouldSkipBooking = skipBookingLookup?.(notification) ?? false;
	const { data } = useQuery(GET_BOOKING, {
		skip: shouldSkipBooking || notification.referenceType !== 'BOOKING' || !notification.referenceId,
		variables: { bookingId: notification.referenceId! },
		fetchPolicy: 'cache-first',
	});

	const kind = getNotificationVisualKind(notification, data?.getBooking?.bookingStatus);
	const text = getDisplayText?.(notification) ?? getNotificationDisplayText(notification, kind, t);
	const showSender = shouldShowNotificationSender(notification) && !shouldSkipBooking;
	const isWarning = isAdminWarningNotification(notification);

	return (
		<div className={`fixora-notif-dropdown__row ${!notification.isRead ? 'fixora-notif-dropdown__row--unread' : ''}`}>
			<button type="button" className="fixora-notif-dropdown__item" onClick={onClick}>
				<NotificationVisualIcon notification={notification} bookingStatus={data?.getBooking?.bookingStatus} />
				<span className="fixora-notif-dropdown__body">
					{isWarning && notification.notificationTitle && (
						<span className="fixora-notif-dropdown__title">{notification.notificationTitle}</span>
					)}
					{showSender && notification.userId && (
						<NotificationSender userId={notification.userId} className="fixora-notif-dropdown__sender" />
					)}
					<span className={`fixora-notif-dropdown__text${isWarning ? ' fixora-notif-dropdown__text--warning' : ''}`}>
						{text}
					</span>
					<Moment fromNow className="fixora-notif-dropdown__time">
						{notification.createdAt}
					</Moment>
				</span>
				{!notification.isRead && <span className="fixora-notif-dropdown__dot" />}
			</button>
			{onDelete && (
				<button
					type="button"
					className="fixora-notif-dropdown__delete"
					title={t('notifications.delete')}
					aria-label={t('notifications.delete')}
					onClick={(e) => {
						e.stopPropagation();
						onDelete();
					}}
				>
					×
				</button>
			)}
		</div>
	);
};

const NotificationDropdown = ({
	notifications,
	onItemClick,
	onViewAll,
	onDelete,
	viewAllHref = '/notifications',
	getDisplayText,
	skipBookingLookup,
	listPrefix,
	embedded = false,
	loading = false,
	loadingLabel,
	viewAllLabel,
}: NotificationDropdownProps) => {
	const { t } = useTranslation('common');
	const hasListContent = Boolean(listPrefix) || notifications.length > 0;

	return (
		<div className={`fixora-notif-dropdown${embedded ? ' fixora-notif-dropdown--embedded' : ''}`}>
			<div className="fixora-notif-dropdown__header">
				<strong>{t('notifications.title')}</strong>
			</div>

			<div className="fixora-notif-dropdown__list">
				{loading && !hasListContent ? (
					<p className="fixora-notif-dropdown__empty">{loadingLabel ?? t('common.loading')}</p>
				) : !hasListContent ? (
					<p className="fixora-notif-dropdown__empty">{t('notifications.empty')}</p>
				) : (
					<>
						{listPrefix}
						{notifications.map((notification) => (
							<NotificationDropdownItem
								key={notification._id}
								notification={notification}
								onClick={() => onItemClick(notification)}
								onDelete={onDelete ? () => onDelete(notification) : undefined}
								getDisplayText={getDisplayText}
								skipBookingLookup={skipBookingLookup}
							/>
						))}
					</>
				)}
			</div>

			<Link href={viewAllHref} className="fixora-notif-dropdown__view-all" onClick={onViewAll}>
				{viewAllLabel ?? t('notifications.viewAll')}
			</Link>
		</div>
	);
};

export default NotificationDropdown;
