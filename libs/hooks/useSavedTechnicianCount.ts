import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_USER_LIKED_TECHNICIANS } from '../../apollo/user/profile';
import { SAVED_TECHNICIANS_CHANGED } from '../utils/savedTechnicians';

export function useSavedTechnicianCount(userId?: string): number {
	const { data, refetch } = useQuery(GET_USER_LIKED_TECHNICIANS, {
		skip: !userId,
		variables: { input: { page: 1, limit: 1 } },
		fetchPolicy: 'cache-and-network',
	});

	useEffect(() => {
		if (!userId) return;

		const onChanged = (event: Event) => {
			const detail = (event as CustomEvent<{ userId?: string }>).detail;
			if (!detail?.userId || detail.userId === userId) refetch();
		};

		window.addEventListener(SAVED_TECHNICIANS_CHANGED, onChanged);
		return () => window.removeEventListener(SAVED_TECHNICIANS_CHANGED, onChanged);
	}, [refetch, userId]);

	return data?.getUserLikedTechnicians?.metaCounter?.[0]?.total ?? 0;
}
