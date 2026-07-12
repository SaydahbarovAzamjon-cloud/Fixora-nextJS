import React, { useEffect, useRef } from 'react';

import Head from 'next/head';

import { Stack } from '@mui/material';

import { useRouter } from 'next/router';

import { useTranslation } from 'next-i18next';

import useDeviceDetect from '../../hooks/useDeviceDetect';

import { getJwtToken, updateUserInfo } from '../../auth';

import { getPostSignupOnboardingStatus } from '../../auth/postSignupOnboarding';

import { resolveAuthUser } from '../../utils/authSession';

import {

	getPostSignupOnboardingPath,

	resolvePostAuthDestination,

} from '../../utils/postAuthDestination';

import {

	isPostSignupOnboardingRoute,

	ONBOARDING_TECHNICIAN_PATH,

} from '../../utils/onboardingRoutes';

import { routePathsEqual } from '../../utils/routePaths';



const withLayoutOnboarding = (Component: React.ComponentType, pageTitleKey = 'onboarding.meta.title') => {

	return (props: Record<string, unknown>) => {

		const { t } = useTranslation('auth');

		const device = useDeviceDetect();

		const router = useRouter();

		const redirectingRef = useRef(false);



		useEffect(() => {

			const jwt = getJwtToken();

			if (!jwt) {

				void router.replace('/login');

				return;

			}

			updateUserInfo(jwt);



			const authUser = resolveAuthUser();

			if (!authUser?._id || redirectingRef.current) return;



			const status = getPostSignupOnboardingStatus(authUser._id);

			if (status === 'completed') {

				const target = resolvePostAuthDestination(authUser);

				if (!routePathsEqual(router.pathname, target)) {

					redirectingRef.current = true;

					void router.replace(target).finally(() => {

						redirectingRef.current = false;

					});

				}

				return;

			}



			const expectedPath = getPostSignupOnboardingPath(authUser);

			if (isPostSignupOnboardingRoute(router.pathname) && !routePathsEqual(router.pathname, expectedPath)) {

				redirectingRef.current = true;

				void router.replace(expectedPath).finally(() => {

					redirectingRef.current = false;

				});

			}

		}, [router, router.pathname]);



		const wrapId = device === 'mobile' ? 'mobile-wrap' : 'pc-wrap';

		const isTechnicianPage = router.pathname === ONBOARDING_TECHNICIAN_PATH;



		return (

			<>

				<Head>

					<title>{`${t(pageTitleKey)} | Fixora`}</title>

					<meta name="title" content={`${t(pageTitleKey)} | Fixora`} />

				</Head>

				<Stack id={wrapId}>

					<Stack className="auth-page">

						<Stack

							className={`auth-page__inner${isTechnicianPage ? ' auth-page__inner--onboarding-tech' : ''}`}

						>

							<Component {...props} />

						</Stack>

					</Stack>

				</Stack>

			</>

		);

	};

};



export default withLayoutOnboarding;

export { ONBOARDING_TECHNICIAN_PATH };


