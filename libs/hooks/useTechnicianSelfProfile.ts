import { useQuery, useReactiveVar } from '@apollo/client';
import { GET_USER } from '../../apollo/user/query';
import { userVar } from '../../apollo/store';
import { technicianProfileFromAuth } from '../auth/technicianProfileFromAuth';
import { shouldSkipPublicGetUser } from '../auth/technicianPublicProfileAccess';
import { syncUserVarFromGraphqlUser } from '../auth/syncUserVar';
import { TECHNICIAN_PORTAL_QUERY_CONTEXT } from '../apollo/technicianQueryContext';
import { resolveAuthUser } from '../utils/authSession';
import { TechnicianProfile } from '../types/fixora/fixora';
import { useEffect } from 'react';
import { useIsClientReady } from './useIsClientReady';

/**
 * Load the signed-in technician's profile. Uses public `getUser` when available (APPROVED),
 * otherwise falls back to JWT/userVar (PENDING / UNDER_REVIEW onboarding).
 */
export function useTechnicianSelfProfile(userId?: string | null) {
	const authUser = useReactiveVar(userVar);
	const isClientReady = useIsClientReady();
	const sessionUser = authUser?._id ? authUser : isClientReady ? resolveAuthUser() : null;
	const resolvedId = userId || sessionUser?._id;
	const skipGetUser = !resolvedId || shouldSkipPublicGetUser(sessionUser);

	const { data, loading, error, refetch } = useQuery(GET_USER, {
		variables: { userId: resolvedId! },
		skip: skipGetUser,
		fetchPolicy: 'cache-and-network',
		errorPolicy: 'all',
		context: TECHNICIAN_PORTAL_QUERY_CONTEXT,
	});

	const graphqlProfile = (data?.getUser as TechnicianProfile | undefined) ?? null;
	const authProfile = technicianProfileFromAuth(sessionUser);
	const profile: TechnicianProfile | null = graphqlProfile ?? authProfile;
	const pendingOffline = !graphqlProfile && !!authProfile && !!error;

	useEffect(() => {
		if (graphqlProfile) syncUserVarFromGraphqlUser(graphqlProfile);
	}, [graphqlProfile]);

	return {
		profile,
		loading: loading && !profile,
		error,
		refetch,
		pendingOffline,
	};
}
