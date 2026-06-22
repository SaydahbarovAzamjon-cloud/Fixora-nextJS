import { useQueries } from '@apollo/client';
import { useMemo } from 'react';
import { GET_ADMIN_USER } from '../../apollo/admin/query';
import type { AdminUser } from '../types/admin/admin';

export function displayUserName(user?: Pick<AdminUser, 'userFullName' | 'userNickname' | '_id'> & { memberNick?: string; memberFullName?: string } | null): string {
	if (!user) return '—';
	return user.userFullName || user.userNickname || user.memberFullName || user.memberNick || user._id.slice(-6);
}

export function useUserLookup(userIds: string[]) {
	const uniqueIds = useMemo(() => [...new Set(userIds.filter(Boolean))], [userIds]);

	const results = useQueries({
		queries: uniqueIds.map((userId) => ({
			query: GET_ADMIN_USER,
			variables: { userId },
			skip: !userId,
		})),
	});

	const map = useMemo(() => {
		const out = new Map<string, AdminUser>();
		results.forEach((result, index) => {
			const user = result.data?.getUser as AdminUser | undefined;
			if (user?._id) out.set(uniqueIds[index], user);
		});
		return out;
	}, [results, uniqueIds]);

	const loading = results.some((r) => r.loading);

	return { map, loading, name: (id: string) => displayUserName(map.get(id) ?? { _id: id }) };
}
