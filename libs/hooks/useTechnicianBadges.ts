import { useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { GET_INCOMING_REQUESTS, GET_TECHNICIAN_BOOKINGS } from '../../apollo/user/profile';
import { GET_MY_CONVERSATIONS } from '../../apollo/user/message';
import { GET_NOTIFICATIONS } from '../../apollo/user/notification';

export interface TechnicianBadges {
	requests: number;
	jobs: number;
	messages: number;
	notifications: number;
}

/**
 * Shared live counts for the technician sidebar + header badges.
 * Reuses the exact query variables the dashboard uses, so Apollo dedupes the
 * network requests (one fetch shared across dashboard / sidebar / header).
 */
const useTechnicianBadges = (): TechnicianBadges => {
	const user = useReactiveVar(userVar);
	const skip = !user?._id;

	const { data: requestsData } = useQuery(GET_INCOMING_REQUESTS, {
		skip,
		variables: { input: { page: 1, limit: 100, search: {} } },
		fetchPolicy: 'cache-and-network',
		pollInterval: 30000,
	});

	const { data: bookingsData } = useQuery(GET_TECHNICIAN_BOOKINGS, {
		skip,
		variables: { input: { page: 1, limit: 100, search: {} } },
		fetchPolicy: 'cache-and-network',
		pollInterval: 30000,
	});

	const { data: conversationsData } = useQuery(GET_MY_CONVERSATIONS, {
		skip,
		variables: { input: { page: 1, limit: 50 } },
		fetchPolicy: 'cache-and-network',
		pollInterval: 30000,
	});

	const { data: notificationsData } = useQuery(GET_NOTIFICATIONS, {
		skip,
		variables: { input: { page: 1, limit: 50, search: { isRead: false } } },
		fetchPolicy: 'cache-and-network',
		pollInterval: 30000,
	});

	const requestsList = requestsData?.getIncomingRequests?.list ?? [];
	const requests = requestsData?.getIncomingRequests?.metaCounter?.[0]?.total ?? requestsList.length;

	const jobs = (bookingsData?.getTechnicianBookings?.list ?? []).filter((b: any) =>
		['ACCEPTED', 'IN_PROGRESS'].includes(b?.bookingStatus),
	).length;

	const messages = (conversationsData?.getMyConversations?.list ?? []).reduce(
		(sum: number, c: { unreadCount?: number }) => sum + (c?.unreadCount ?? 0),
		0,
	);

	const notifications = (notificationsData?.getNotifications?.list ?? []).filter(
		(n: any) => n?.notificationType !== 'MESSAGE',
	).length;

	return { requests, jobs, messages, notifications };
};

export default useTechnicianBadges;
