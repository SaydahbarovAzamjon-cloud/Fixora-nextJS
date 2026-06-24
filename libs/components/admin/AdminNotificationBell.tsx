import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMutation } from '@apollo/client';
import { Bell, ShieldCheck } from 'lucide-react';
import { MARK_NOTIFICATION_READ } from '../../../apollo/user/notification';
import { Notification } from '../../types/fixora/fixora';
import { getAdminNotificationDisplayText, getAdminNotificationLink } from '../../utils/adminNotifications';
import { useAdminNotifications } from '../../hooks/useAdminNotifications';
import { useAdminBadges } from '../../hooks/useAdminBadges';
import { useAdminVerificationAlerts } from '../../hooks/useAdminVerificationAlerts';
import { displayUserName } from '../../hooks/useUserLookup';
import { verificationStatusLabelKey, verificationStatusTone } from '../../utils/adminBadges';
import AdminStatusBadge from './shared/AdminStatusBadge';
import NotificationDropdown from '../notifications/NotificationDropdown';

const AdminNotificationBell: React.FC = () => {
	const { t } = useTranslation('admin');
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const { notifications, unreadCount, loading, refetchAll } = useAdminNotifications();
	const { verificationCount, moderationCount } = useAdminBadges();
	const { alerts: verificationAlerts } = useAdminVerificationAlerts();
	const [markRead] = useMutation(MARK_NOTIFICATION_READ);

	const bellCount = unreadCount + verificationCount + moderationCount;

	const viewAllRoute = useMemo(() => {
		if (verificationCount > 0) return '/_admin/verification';
		if (moderationCount > 0) return '/_admin/moderation';
		return '/_admin/verification';
	}, [verificationCount, moderationCount]);

	const viewAllLabel = useMemo(() => {
		if (verificationCount > 0) return t('header.viewVerificationQueue');
		if (moderationCount > 0) return t('header.viewModerationQueue');
		return t('header.viewVerificationQueue');
	}, [verificationCount, moderationCount, t]);

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
				{bellCount > 0 && (
					<span className="fixora-admin-header__bell-count">{bellCount > 9 ? '9+' : bellCount}</span>
				)}
			</button>
			{open && (
				<NotificationDropdown
					embedded
					loading={loading}
					loadingLabel={t('common.loading')}
					notifications={notifications}
					listPrefix={
						verificationAlerts.length > 0
							? verificationAlerts.map((tech) => {
									const name = displayUserName(tech);
									return (
										<div
											key={tech._id}
											className="fixora-notif-dropdown__row fixora-notif-dropdown__row--unread"
										>
											<button
												type="button"
												className="fixora-notif-dropdown__item"
												onClick={() => {
													setOpen(false);
													router.push('/_admin/verification');
												}}
											>
												<span className="fixora-notif-dropdown__icon fixora-notif-dropdown__icon--verification">
													<ShieldCheck size={16} />
												</span>
												<span className="fixora-notif-dropdown__body">
													<span className="fixora-notif-dropdown__text">
														{t('header.notificationsVerification', { name })}
													</span>
													<span className="fixora-admin-notif-dropdown__badge">
														<AdminStatusBadge
															label={t(verificationStatusLabelKey(tech.verificationStatus))}
															tone={verificationStatusTone(tech.verificationStatus)}
														/>
													</span>
												</span>
												<span className="fixora-notif-dropdown__dot" />
											</button>
										</div>
									);
								})
							: undefined
					}
					onItemClick={handleItemClick}
					onViewAll={() => {
						setOpen(false);
						router.push(viewAllRoute);
					}}
					viewAllHref={viewAllRoute}
					viewAllLabel={viewAllLabel}
					getDisplayText={getAdminNotificationDisplayText}
				/>
			)}
		</div>
	);
};

export default AdminNotificationBell;
