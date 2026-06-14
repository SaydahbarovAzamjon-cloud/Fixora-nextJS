import React, { useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import Moment from 'react-moment';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DoneIcon from '@mui/icons-material/Done';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { GET_NOTIFICATIONS, MARK_NOTIFICATION_READ, MARK_ALL_NOTIFICATIONS_READ } from '../../apollo/user/notification';
import { userVar } from '../../apollo/store';
import { Notification } from '../../libs/types/fixora/fixora';
import { FixoraButton } from '../../libs/components/ui';
import { NOTIFICATION_CATEGORY_ICONS, getNotificationCategory, getNotificationLink, getNotificationText } from '../../libs/utils/notifications';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	},
});

const PAGE_SIZE = 20;

const NotificationsPage: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [page, setPage] = useState(1);
	const [notifications, setNotifications] = useState<Notification[]>([]);

	/** APOLLO REQUESTS **/
	const { data, fetchMore } = useQuery(GET_NOTIFICATIONS, {
		skip: !user?._id,
		variables: { input: { page: 1, limit: PAGE_SIZE, sort: 'createdAt', direction: 'DESC' } },
		fetchPolicy: 'network-only',
		onCompleted: (result) => {
			if (page === 1) {
				const list: Notification[] = result?.getNotifications?.list ?? [];
				setNotifications(list.filter((n) => n.notificationType !== 'MESSAGE'));
			}
		},
	});

	const total: number = data?.getNotifications?.metaCounter?.[0]?.total ?? 0;
	const hasMore = page * PAGE_SIZE < total;

	const [markNotificationRead] = useMutation(MARK_NOTIFICATION_READ);
	const [markAllNotificationsRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ);

	/** LIFECYCLES **/
	useEffect(() => {
		if (!user?._id) {
			router.push('/').then();
		}
	}, [user]);

	/** HANDLERS **/
	const openNotification = async (notification: Notification) => {
		if (!notification.isRead) {
			await markAsRead(notification);
		}
		const link = getNotificationLink(notification);
		if (link) router.push(link);
	};

	const markAsRead = async (notification: Notification) => {
		try {
			await markNotificationRead({ variables: { input: { notificationId: notification._id } } });
			setNotifications((prev) => prev.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n)));
		} catch {
			/* ignore */
		}
	};

	const markAllRead = async () => {
		try {
			await markAllNotificationsRead();
			setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
		} catch {
			/* ignore */
		}
	};

	const loadMore = async () => {
		const nextPage = page + 1;
		const result = await fetchMore({
			variables: { input: { page: nextPage, limit: PAGE_SIZE, sort: 'createdAt', direction: 'DESC' } },
		});
		setPage(nextPage);
		const list: Notification[] = result.data?.getNotifications?.list ?? [];
		setNotifications((prev) => [...prev, ...list.filter((n) => n.notificationType !== 'MESSAGE')]);
	};

	const { today, yesterday, earlier } = useMemo(() => {
		const startOfToday = new Date();
		startOfToday.setHours(0, 0, 0, 0);
		const startOfYesterday = new Date(startOfToday);
		startOfYesterday.setDate(startOfYesterday.getDate() - 1);

		const todayList: Notification[] = [];
		const yesterdayList: Notification[] = [];
		const earlierList: Notification[] = [];
		notifications.forEach((n) => {
			const createdAt = new Date(n.createdAt);
			if (createdAt >= startOfToday) todayList.push(n);
			else if (createdAt >= startOfYesterday) yesterdayList.push(n);
			else earlierList.push(n);
		});
		return { today: todayList, yesterday: yesterdayList, earlier: earlierList };
	}, [notifications]);

	const renderGroup = (title: string, list: Notification[]) => {
		if (!list.length) return null;
		return (
			<div className="fixora-notifications__group">
				<h3 className="fixora-notifications__group-title">{title}</h3>
				{list.map((notification) => {
					const Icon = NOTIFICATION_CATEGORY_ICONS[getNotificationCategory(notification)];
					return (
						<div
							key={notification._id}
							className={`fixora-notifications__item ${!notification.isRead ? 'fixora-notifications__item--unread' : ''}`}
						>
							<button type="button" className="fixora-notifications__item-main" onClick={() => openNotification(notification)}>
								<span className="fixora-notifications__icon">
									<Icon fontSize="small" />
								</span>
								<span className="fixora-notifications__body">
									<span className="fixora-notifications__text">{getNotificationText(notification, t)}</span>
									<Moment fromNow className="fixora-notifications__time">
										{notification.createdAt}
									</Moment>
								</span>
								<ChevronRightIcon className="fixora-notifications__chevron" fontSize="small" />
							</button>
							{!notification.isRead && (
								<button
									type="button"
									className="fixora-notifications__mark-read"
									title={t('notifications.markRead')}
									onClick={() => markAsRead(notification)}
								>
									<DoneIcon fontSize="small" />
								</button>
							)}
						</div>
					);
				})}
			</div>
		);
	};

	return (
		<div className="fixora-notifications-page">
			<div className="container fixora-notifications">
				{notifications.length === 0 ? (
					<p className="fixora-notifications__empty">{t('notifications.empty')}</p>
				) : (
					<>
						{renderGroup(t('notifications.today'), today)}
						{renderGroup(t('notifications.yesterday'), yesterday)}
						{renderGroup(t('notifications.earlier'), earlier)}
					</>
				)}

				{hasMore && (
					<FixoraButton variant="outline" className="fixora-notifications__load-more" onClick={loadMore}>
						{t('notifications.loadMore')}
					</FixoraButton>
				)}

				{notifications.some((n) => !n.isRead) && (
					<FixoraButton variant="outline" className="fixora-notifications__mark-all" onClick={markAllRead}>
						{t('notifications.markAllRead')}
					</FixoraButton>
				)}
			</div>
		</div>
	);
};

export default withLayoutFull(NotificationsPage);
