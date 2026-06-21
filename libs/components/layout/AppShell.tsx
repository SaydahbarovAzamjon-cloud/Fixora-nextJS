import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { getJwtToken, updateUserInfo } from '../../auth';
import { useTechnicianPortalRedirect } from '../../hooks/useTechnicianPortalRedirect';
import { resolveAuthUser } from '../../utils/authSession';
import {
	getRouteLayoutScope,
	isTechnicianPortalRedirectRoute,
	redirectTechnicianToPortal,
} from '../../utils/customerRoutes';
import { isTechnicianUser } from '../../utils/userRole';

type AppShellProps = Pick<AppProps, 'Component' | 'pageProps'>;

const AppShell = ({ Component, pageProps }: AppShellProps) => {
	const router = useRouter();
	const blockedForTechnician = useTechnicianPortalRedirect();
	const layoutScope = getRouteLayoutScope(router.pathname);

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	useEffect(() => {
		const guardRouteChange = (url: string) => {
			const pathname = url.split('?')[0];
			const authUser = resolveAuthUser();
			if (!authUser?._id || !isTechnicianUser(authUser)) return;
			if (!isTechnicianPortalRedirectRoute(pathname)) return;
			redirectTechnicianToPortal(pathname, authUser._id);
		};

		router.events.on('routeChangeStart', guardRouteChange);
		return () => router.events.off('routeChangeStart', guardRouteChange);
	}, [router]);

	if (blockedForTechnician) {
		return null;
	}

	return <Component key={`${layoutScope}:${router.asPath}`} {...pageProps} />;
};

export default AppShell;
