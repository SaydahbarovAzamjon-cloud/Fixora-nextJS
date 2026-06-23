import { useQuery } from '@apollo/client';
import { GET_ALL_BOOKINGS_BY_ADMIN } from '../../apollo/admin/query';
import type { BookingStatus } from '../types/fixora/fixora';

const STATUSES: BookingStatus[] = ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED'];

function useStatusCount(status: BookingStatus): number {
	const { data } = useQuery(GET_ALL_BOOKINGS_BY_ADMIN, {
		variables: { input: { page: 1, limit: 1, search: { bookingStatus: status } } },
		fetchPolicy: 'cache-and-network',
	});
	return data?.getAllBookingsByAdmin?.metaCounter?.[0]?.total ?? 0;
}

export function useBookingStatusCounts(): Record<BookingStatus, number> {
	const pending = useStatusCount('PENDING');
	const accepted = useStatusCount('ACCEPTED');
	const inProgress = useStatusCount('IN_PROGRESS');
	const completed = useStatusCount('COMPLETED');
	const cancelled = useStatusCount('CANCELLED');
	const rejected = useStatusCount('REJECTED');

	return {
		PENDING: pending,
		ACCEPTED: accepted,
		IN_PROGRESS: inProgress,
		COMPLETED: completed,
		CANCELLED: cancelled,
		REJECTED: rejected,
	};
}

export { STATUSES as BOOKING_STATUSES };
