import { useQuery } from '@apollo/client';
import { GET_NOTIFICATIONS } from '../../apollo/user/notification';
import type { Notification } from '../types/fixora/fixora';

/** Admin bell — notifications from API only. */
export function useAdminNotifications() {
	const { data, loading, refetch } = useQuery(GET_NOTIFICATIONS, {
		variables: { input: { page: 1, limit: 20, sort: 'createdAt', direction: 'DESC' } },
		fetchPolicy: 'network-only',
		pollInterval: 60000,
	});

	const { data: unreadData, refetch: refetchUnread } = useQuery(GET_NOTIFICATIONS, {
		variables: { input: { page: 1, limit: 50, search: { isRead: false }, sort: 'createdAt', direction: 'DESC' } },
		fetchPolicy: 'network-only',
		pollInterval: 60000,
	});

	const notifications: Notification[] = data?.getNotifications?.list ?? [];
	const unreadCount =
		unreadData?.getNotifications?.metaCounter?.[0]?.total ??
		unreadData?.getNotifications?.list?.filter((notification) => !notification.isRead).length ??
		0;

	const refetchAll = async () => {
		await Promise.all([refetch(), refetchUnread()]);
	};

	return { notifications, unreadCount, loading, refetchAll };
}
