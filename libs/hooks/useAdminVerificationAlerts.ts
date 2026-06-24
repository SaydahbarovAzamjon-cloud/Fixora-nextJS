import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_TECHNICIAN_VERIFICATION_QUEUE } from '../../apollo/admin/query';
import type { AdminUser } from '../types/admin/admin';

const ACTIONABLE_STATUSES = new Set(['PENDING', 'UNDER_REVIEW']);

/** Pending + under-review technicians for admin header alerts (no GraphQL notification type yet). */
export function useAdminVerificationAlerts() {
	const { data, loading } = useQuery(GET_TECHNICIAN_VERIFICATION_QUEUE, {
		variables: {
			input: {
				page: 1,
				limit: 10,
				search: {},
			},
		},
		fetchPolicy: 'cache-and-network',
		pollInterval: 60000,
	});

	const alerts: AdminUser[] = useMemo(() => {
		const list: AdminUser[] = data?.getTechnicianVerificationQueue?.list ?? [];
		return list
			.filter((user) => ACTIONABLE_STATUSES.has(user.verificationStatus ?? ''))
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
	}, [data?.getTechnicianVerificationQueue?.list]);

	return { alerts, loading };
}
