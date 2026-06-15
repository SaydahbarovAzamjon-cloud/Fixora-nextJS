import React, { useEffect } from 'react';
import Head from 'next/head';
import { Stack } from '@mui/material';
import { useTranslation } from 'next-i18next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { getJwtToken, updateUserInfo } from '../../auth';

const withLayoutAuth = (Component: any, pageTitleKey = 'auth.meta.title') => {
	return (props: any) => {
		const { t } = useTranslation('auth');
		const device = useDeviceDetect();

		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

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
