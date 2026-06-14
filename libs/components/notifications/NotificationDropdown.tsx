import React from 'react';
import Link from 'next/link';
import Moment from 'react-moment';
import { useTranslation } from 'next-i18next';
import { Notification } from '../../types/fixora/fixora';
import { NOTIFICATION_CATEGORY_ICONS, getNotificationCategory, getNotificationText } from '../../utils/notifications';

export interface NotificationDropdownProps {
	notifications: Notification[];
	onItemClick: (notification: Notification) => void;
	onViewAll: () => void;
}

const NotificationDropdown = ({ notifications, onItemClick, onViewAll }: NotificationDropdownProps) => {
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
					notifications.map((notification) => {
						const Icon = NOTIFICATION_CATEGORY_ICONS[getNotificationCategory(notification)];
						return (
							<button
								key={notification._id}
								type="button"
								className={`fixora-notif-dropdown__item ${
									!notification.isRead ? 'fixora-notif-dropdown__item--unread' : ''
								}`}
								onClick={() => onItemClick(notification)}
							>
								<span className="fixora-notif-dropdown__icon">
									<Icon fontSize="small" />
								</span>
								<span className="fixora-notif-dropdown__body">
									<span className="fixora-notif-dropdown__text">{getNotificationText(notification, t)}</span>
									<Moment fromNow className="fixora-notif-dropdown__time">
										{notification.createdAt}
									</Moment>
								</span>
								{!notification.isRead && <span className="fixora-notif-dropdown__dot" />}
							</button>
						);
					})
				)}
			</div>

			<Link href="/notifications" className="fixora-notif-dropdown__view-all" onClick={onViewAll}>
				{t('notifications.viewAll')}
			</Link>
		</div>
	);
};

export default NotificationDropdown;
