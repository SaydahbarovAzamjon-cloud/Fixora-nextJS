import { useApolloClient } from '@apollo/client';
import { useEffect, useMemo, useState } from 'react';
import { GET_ADMIN_USER } from '../../apollo/admin/query';
import type { AdminUser } from '../types/admin/admin';

export function displayUserName(user?: Pick<AdminUser, 'userFullName' | 'userNickname' | '_id'> & { memberNick?: string; memberFullName?: string } | null): string {
	if (!user) return '—';
	return user.userFullName || user.userNickname || user.memberFullName || user.memberNick || user._id.slice(-6);
}

export function useUserLookup(userIds: string[]) {
	const client = useApolloClient();
	const idsKey = useMemo(() => {
		const unique = [...new Set(userIds.filter(Boolean))].sort();
		return unique.join('|');
	}, [userIds.join('|')]);
	const [map, setMap] = useState<Map<string, AdminUser>>(() => new Map());
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!idsKey) {
			setMap(new Map());
			setLoading(false);
			return;
		}

		const uniqueIds = idsKey.split('|');
		let cancelled = false;
		setLoading(true);

		Promise.allSettled(
			uniqueIds.map((userId) =>
				client.query({
					query: GET_ADMIN_USER,
					variables: { userId },
					fetchPolicy: 'cache-first',
					errorPolicy: 'ignore',
				}),
			),
		)
			.then((results) => {
				if (cancelled) return;
				const out = new Map<string, AdminUser>();
				results.forEach((result, index) => {
					if (result.status !== 'fulfilled') return;
					const user = result.value.data?.getUser as AdminUser | undefined;
					if (user?._id) out.set(uniqueIds[index], user);
				});
				setMap(out);
			})
			.catch(() => {
				if (!cancelled) setMap(new Map());
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [client, idsKey]);

	return {
		map,
		loading,
		name: (id: string) => displayUserName(map.get(id) ?? { _id: id }),
		user: (id: string) => map.get(id),
	};
}
