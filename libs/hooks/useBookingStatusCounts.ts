import { useQueries } from '@apollo/client';
import { GET_ALL_BOOKINGS_BY_ADMIN } from '../../apollo/admin/query';
import type { BookingStatus } from '../fixora/fixora';

const STATUSES: BookingStatus[] = ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED'];

export function useBookingStatusCounts(): Record<BookingStatus, number> {
	const results = useQueries({
		queries: STATUSES.map((status) => ({
			query: GET_ALL_BOOKINGS_BY_ADMIN,
			variables: { input: { page: 1, limit: 1, search: { bookingStatus: status } } },
			fetchPolicy: 'cache-and-network' as const,
		})),
	});

	return STATUSES.reduce(
		(acc, status, i) => {
			acc[status] = results[i]?.data?.getAllBookingsByAdmin?.metaCounter?.[0]?.total ?? 0;
			return acc;
		},
		{} as Record<BookingStatus, number>,
	);
}

export { STATUSES as BOOKING_STATUSES };
