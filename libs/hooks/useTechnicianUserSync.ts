import { useEffect } from 'react';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { getJwtToken, updateUserInfo } from '../auth';
import { useTechnicianSelfProfile } from './useTechnicianSelfProfile';

/** Hydrate userVar from JWT, then refresh name/avatar from GraphQL (JWT can be stale after settings save). */
export function useTechnicianUserSync() {
	const user = useReactiveVar(userVar);

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt && !user._id) updateUserInfo(jwt);
	}, [user._id]);

	useTechnicianSelfProfile(user?._id);
}
