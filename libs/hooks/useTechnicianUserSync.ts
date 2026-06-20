import { useEffect } from 'react';
import { useQuery, useReactiveVar } from '@apollo/client';
import { GET_USER } from '../../apollo/user/query';
import { userVar } from '../../apollo/store';
import { getJwtToken, updateUserInfo } from '../auth';
import { syncUserVarFromGraphqlUser } from '../auth/syncUserVar';

/** Hydrate userVar from JWT, then refresh name/avatar from GraphQL (JWT can be stale after settings save). */
export function useTechnicianUserSync() {
	const user = useReactiveVar(userVar);

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt && !user._id) updateUserInfo(jwt);
	}, [user._id]);

	const userId = user?._id;

	const { data } = useQuery(GET_USER, {
		variables: { userId: userId! },
		skip: !userId || !getJwtToken(),
		fetchPolicy: 'cache-and-network',
	});

	useEffect(() => {
		const profile = data?.getUser;
		if (profile) syncUserVarFromGraphqlUser(profile);
	}, [data]);
}
