import { useApolloClient, useQuery } from '@apollo/client';
import { useEffect, useMemo, useState } from 'react';
import { GET_ALL_BOOKINGS_BY_ADMIN } from '../../apollo/admin/query';
import type { AdminBooking } from '../types/admin/admin';

export function useDeviceTechnicianMap(deviceIds: string[]) {
	const client = useApolloClient();
	const idsKey = useMemo(() => [...new Set(deviceIds.filter(Boolean))].sort().join('|'), [deviceIds.join('|')]);
	const [extraMap, setExtraMap] = useState<Map<string, string>>(() => new Map());

	const { data, loading } = useQuery(GET_ALL_BOOKINGS_BY_ADMIN, {
		variables: {
			input: {
				page: 1,
				limit: 500,
				sort: 'createdAt',
				direction: 'DESC',
			},
		},
		fetchPolicy: 'cache-first',
		skip: !idsKey,
	});

	const bulkMap = useMemo(() => {
		const bookings: AdminBooking[] = data?.getAllBookingsByAdmin?.list ?? [];
		const wanted = new Set(idsKey ? idsKey.split('|') : []);
		const out = new Map<string, string>();

		for (const booking of bookings) {
			if (!booking.deviceId || !wanted.has(booking.deviceId) || !booking.technicianId) continue;
			if (!out.has(booking.deviceId)) {
				out.set(booking.deviceId, booking.technicianId);
			}
		}

		return out;
	}, [data, idsKey]);

	useEffect(() => {
		if (!idsKey) {
			setExtraMap(new Map());
			return;
		}

		const wanted = idsKey.split('|');
		const missing = wanted.filter((deviceId) => !bulkMap.has(deviceId));
		if (!missing.length) return;

		let cancelled = false;

		Promise.allSettled(
			missing.map((deviceId) =>
				client.query({
					query: GET_ALL_BOOKINGS_BY_ADMIN,
					variables: {
						input: {
							page: 1,
							limit: 1,
							sort: 'createdAt',
							direction: 'DESC',
							search: { deviceId },
						},
					},
					fetchPolicy: 'network-only',
					errorPolicy: 'ignore',
					context: { suppressErrorAlert: true },
				}),
			),
		).then((results) => {
			if (cancelled) return;
			setExtraMap((prev) => {
				const out = new Map(prev);
				results.forEach((result, index) => {
					if (result.status !== 'fulfilled') return;
					const booking = result.value.data?.getAllBookingsByAdmin?.list?.[0] as AdminBooking | undefined;
					if (!booking?.technicianId) return;
					out.set(missing[index], booking.technicianId);
				});
				return out;
			});
		});

		return () => {
			cancelled = true;
		};
	}, [bulkMap, client, idsKey]);

	const map = useMemo(() => {
		const out = new Map(bulkMap);
		extraMap.forEach((value, key) => {
			if (!out.has(key)) out.set(key, value);
		});
		return out;
	}, [bulkMap, extraMap]);

	return {
		map,
		loading,
		technicianId: (deviceId: string) => map.get(deviceId),
	};
}
