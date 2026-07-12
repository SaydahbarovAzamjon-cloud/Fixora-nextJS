import { useQuery, useReactiveVar } from '@apollo/client';
import { GET_USER } from '../../apollo/user/query';
import { userVar } from '../../apollo/store';
import { technicianProfileFromAuth } from '../auth/technicianProfileFromAuth';
import { shouldSkipPublicGetUser } from '../auth/technicianPublicProfileAccess';
import { readTechnicianSettingsCache } from '../auth/technicianSettingsCache';
import { readStoredProfileImage, syncUserVarFromGraphqlUser } from '../auth/syncUserVar';
import { TECHNICIAN_PORTAL_QUERY_CONTEXT } from '../apollo/technicianQueryContext';
import { resolveAuthUser } from '../utils/authSession';
import { TechnicianProfile } from '../types/fixora/fixora';
import { useEffect, useMemo } from 'react';
import { useIsClientReady } from './useIsClientReady';

function pickText(...values: (string | null | undefined)[]): string {
	for (const value of values) {
		if (value?.trim()) return value.trim();
	}
	return '';
}

function mergeSelfProfile(
	graphql: TechnicianProfile | null,
	userId: string,
	authProfile: TechnicianProfile | null,
): TechnicianProfile | null {
	const cached = readTechnicianSettingsCache(userId);
	const storedImage = readStoredProfileImage(userId);
	const base = graphql ?? authProfile;
	if (!base) return null;

	return {
		...base,
		userFullName: pickText(cached?.userFullName, graphql?.userFullName, authProfile?.userFullName) || base.userFullName,
		userNickname: pickText(graphql?.userNickname, cached?.userNickname, authProfile?.userNickname) || base.userNickname,
		userProfileImage:
			pickText(cached?.userProfileImage, storedImage, graphql?.userProfileImage, authProfile?.userProfileImage) ||
			base.userProfileImage,
		userBio: pickText(cached?.userBio, graphql?.userBio, authProfile?.userBio) || base.userBio,
		userLocation: pickText(cached?.userLocation, graphql?.userLocation, authProfile?.userLocation) || base.userLocation,
		shopName: cached?.shopName ?? graphql?.shopName ?? authProfile?.shopName ?? base.shopName,
		specialty: cached?.specialty ?? graphql?.specialty ?? authProfile?.specialty ?? base.specialty,
		services: graphql?.services ?? cached?.services ?? authProfile?.services ?? base.services,
	};
}

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
	const profile: TechnicianProfile | null = useMemo(
		() => (resolvedId ? mergeSelfProfile(graphqlProfile, resolvedId, authProfile) : authProfile),
		[authProfile, graphqlProfile, resolvedId],
	);
	const pendingOffline = !graphqlProfile && !!authProfile && !!error;

	// Sync only from GraphQL — merged profile includes userVar/auth data; syncing it back causes a loop.
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
