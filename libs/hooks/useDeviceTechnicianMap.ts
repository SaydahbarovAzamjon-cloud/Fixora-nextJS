import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ALL_BOOKINGS_BY_ADMIN } from '../../apollo/admin/query';
import type { AdminBooking } from '../types/admin/admin';

const ACTIVE_STATUSES = new Set(['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED']);

export function useDeviceTechnicianMap(deviceIds: string[]) {
	const idsKey = useMemo(() => [...new Set(deviceIds.filter(Boolean))].sort().join('|'), [deviceIds.join('|')]);

	const { data, loading } = useQuery(GET_ALL_BOOKINGS_BY_ADMIN, {
		variables: { input: { page: 1, limit: 200 } },
		fetchPolicy: 'cache-first',
		skip: !idsKey,
	});

	const map = useMemo(() => {
		const bookings: AdminBooking[] = data?.getAllBookingsByAdmin?.list ?? [];
		const wanted = new Set(idsKey ? idsKey.split('|') : []);
		const out = new Map<string, string>();

		for (const booking of bookings) {
			if (!booking.deviceId || !wanted.has(booking.deviceId) || !booking.technicianId) continue;
			if (!ACTIVE_STATUSES.has(booking.bookingStatus)) continue;
			if (!out.has(booking.deviceId)) {
				out.set(booking.deviceId, booking.technicianId);
			}
		}

		return out;
	}, [data, idsKey]);

	return { map, loading, technicianId: (deviceId: string) => map.get(deviceId) };
}
