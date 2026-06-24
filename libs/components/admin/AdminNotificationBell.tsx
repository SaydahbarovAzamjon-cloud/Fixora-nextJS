import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMutation } from '@apollo/client';
import { Bell } from 'lucide-react';
import { MARK_NOTIFICATION_READ } from '../../../apollo/user/notification';
import { Notification } from '../../types/fixora/fixora';
import { getAdminNotificationDisplayText, getAdminNotificationLink } from '../../utils/adminNotifications';
import { useAdminNotifications } from '../../hooks/useAdminNotifications';
import NotificationDropdown from '../notifications/NotificationDropdown';

const AdminNotificationBell: React.FC = () => {
	const { t } = useTranslation('admin');
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const { notifications, unreadCount, loading, refetchAll } = useAdminNotifications();
	const [markRead] = useMutation(MARK_NOTIFICATION_READ);

	useEffect(() => {
		const onDocClick = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener('mousedown', onDocClick);
		return () => document.removeEventListener('mousedown', onDocClick);
	}, []);

	const handleItemClick = async (notification: Notification) => {
		if (!notification.isRead) {
			try {
				await markRead({ variables: { input: { notificationId: notification._id } } });
				await refetchAll();
			} catch {
				// Continue navigation even if mark-read fails
			}
		}

		setOpen(false);

		const link = getAdminNotificationLink(notification);
		if (link) router.push(link);
	};

	return (
		<div className="fixora-admin-header__notif-wrap" ref={ref}>
			<button
				type="button"
				className="fixora-admin-header__bell"
				aria-label={t('header.notifications')}
				aria-expanded={open}
				onClick={() => setOpen((v) => !v)}
			>
				<Bell size={18} />
				{unreadCount > 0 && <span className="fixora-admin-header__bell-count">{unreadCount > 9 ? '9+' : unreadCount}</span>}
			</button>
			{open && (
				<div className="fixora-admin-header__notif-dropdown">
					{loading && notifications.length === 0 ? (
						<p className="fixora-admin-search__item">{t('common.loading')}</p>
					) : (
						<NotificationDropdown
							notifications={notifications}
							onItemClick={handleItemClick}
							onViewAll={() => {
								setOpen(false);
								router.push('/notifications');
							}}
							viewAllHref="/notifications"
							getDisplayText={getAdminNotificationDisplayText}
						/>
					)}
				</div>
			)}
		</div>
	);
};

export default AdminNotificationBell;
