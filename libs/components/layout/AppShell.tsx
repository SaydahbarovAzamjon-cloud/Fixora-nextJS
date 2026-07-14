import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useApolloClient } from '@apollo/client';
import { getJwtToken, updateUserInfo } from '../../auth';
import { maybeConfirmAuthSession } from '../../auth/maybeConfirmAuthSession';
import { needsPostSignupOnboarding } from '../../auth/postSignupOnboarding';
import { useTechnicianPortalRedirect } from '../../hooks/useTechnicianPortalRedirect';
import { resolveAuthUser } from '../../utils/authSession';
import {
	getRouteLayoutScope,
	isTechnicianPortalRedirectRoute,
	redirectTechnicianToPortal,
} from '../../utils/customerRoutes';
import { getPostSignupOnboardingPath } from '../../utils/postAuthDestination';
import { isOnboardingGuardExemptRoute } from '../../utils/onboardingRoutes';
import { isTechnicianUser } from '../../utils/userRole';

type AppShellProps = Pick<AppProps, 'Component' | 'pageProps'>;

const AppShell = ({ Component, pageProps }: AppShellProps) => {
	const router = useRouter();
	const client = useApolloClient();
	const blockedForTechnician = useTechnicianPortalRedirect();
	const layoutScope = getRouteLayoutScope(router.pathname);

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	useEffect(() => {
		const authUser = resolveAuthUser();
		void maybeConfirmAuthSession({
			client,
			pathname: router.pathname,
			userId: authUser?._id,
		});
	}, [client, router.pathname]);

	useEffect(() => {
		const enforceOnboarding = (url: string) => {
			const pathname = url.split('?')[0];
			const authUser = resolveAuthUser();
			if (!authUser?._id || !needsPostSignupOnboarding(authUser._id)) return;
			if (isOnboardingGuardExemptRoute(pathname)) return;
			const target = getPostSignupOnboardingPath(authUser);
			if (pathname === target) return;
			void router.replace(target);
		};

		enforceOnboarding(router.asPath);
		router.events.on('routeChangeStart', enforceOnboarding);
		return () => router.events.off('routeChangeStart', enforceOnboarding);
	}, [router]);

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

	// Remount on route path change only — not query/hash (geo search updates ?input= and must not destroy Kakao map).
	return <Component key={`${layoutScope}:${router.pathname}`} {...pageProps} />;
};

export default AppShell;
