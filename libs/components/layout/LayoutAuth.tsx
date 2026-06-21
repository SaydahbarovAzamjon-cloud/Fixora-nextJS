import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Stack } from '@mui/material';
import { useTranslation } from 'next-i18next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { getJwtToken, updateUserInfo } from '../../auth';
import { getNeedsOnboarding } from '../../auth/fixoraAuth';
import { resolveAuthUser } from '../../utils/authSession';
import { getPostAuthRoute } from '../../utils/postAuthRoute';

const withLayoutAuth = (Component: any, pageTitleKey = 'auth.meta.title') => {
	return (props: any) => {
		const { t } = useTranslation('auth');
		const device = useDeviceDetect();
		const router = useRouter();

		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		useEffect(() => {
			if (getNeedsOnboarding()) return;
			const authUser = resolveAuthUser();
			if (!authUser?._id) return;
			router.replace(getPostAuthRoute(authUser)).then();
		}, [router]);

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
