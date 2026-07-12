import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Stack } from '@mui/material';
import { useTranslation } from 'next-i18next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { getJwtToken, updateUserInfo } from '../../auth';
import { getNeedsOnboarding } from '../../auth/fixoraAuth';
import { resolveAuthUser } from '../../utils/authSession';
import { resolvePostAuthDestination } from '../../utils/postAuthDestination';
import { routePathsEqual } from '../../utils/routePaths';

const withLayoutAuth = (Component: any, pageTitleKey = 'auth.meta.title') => {
	return (props: any) => {
		const { t } = useTranslation('auth');
		const device = useDeviceDetect();
		const router = useRouter();
		const redirectingRef = useRef(false);
		const authUserId = resolveAuthUser()?._id ?? '';
		const referrer = typeof router.query.referrer === 'string' ? router.query.referrer : null;

		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		useEffect(() => {
			if (getNeedsOnboarding() || !authUserId || redirectingRef.current) return;

			const authUser = resolveAuthUser();
			if (!authUser?._id) return;

			const target = resolvePostAuthDestination(authUser, referrer);
			if (routePathsEqual(router.pathname, target)) return;

			redirectingRef.current = true;
			void router.replace(target).finally(() => {
				redirectingRef.current = false;
			});
		}, [authUserId, referrer, router.pathname]);

		const wrapId = device === 'mobile' ? 'mobile-wrap' : 'pc-wrap';

		return (
			<>
				<Head>
					<title>{`${t(pageTitleKey)} | Fixora`}</title>
					<meta name="title" content={`${t(pageTitleKey)} | Fixora`} />
				</Head>
				<Stack id={wrapId}>
					<Stack className="auth-page">
						<Stack className="auth-page__inner">
							<Component {...props} />
						</Stack>
					</Stack>
				</Stack>
			</>
		);
	};
};

export default withLayoutAuth;
