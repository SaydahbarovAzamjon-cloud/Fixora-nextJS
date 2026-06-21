import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { updateUserInfo, getJwtToken } from '../auth';
import { resolveAuthUser } from '../utils/authSession';
import {
	isTechnicianPortalRedirectRoute,
	redirectTechnicianToPortal,
} from '../utils/customerRoutes';
import { isTechnicianUser } from '../utils/userRole';

/** Redirect logged-in technicians away from all public client routes. */
export function useTechnicianPortalRedirect(): boolean {
	const router = useRouter();
	const user = useReactiveVar(userVar);

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt && !user._id) updateUserInfo(jwt);
	}, [user._id]);

	const authUser = user._id ? user : resolveAuthUser();
	const shouldRedirect =
		isTechnicianPortalRedirectRoute(router.pathname) && !!authUser?._id && isTechnicianUser(authUser);

	useEffect(() => {
		if (!shouldRedirect) return;
		redirectTechnicianToPortal(router.pathname, authUser?._id);
	}, [shouldRedirect, router.pathname, authUser?._id]);

	return shouldRedirect;
}
