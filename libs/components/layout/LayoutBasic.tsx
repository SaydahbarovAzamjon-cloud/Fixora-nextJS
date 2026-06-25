import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
import { getJwtToken, updateUserInfo } from '../../auth';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useTranslation } from 'next-i18next';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const withLayoutBasic = (Component: any) => {
	return (props: any) => {
		const router = useRouter();
		const { t } = useTranslation('common');
		const device = useDeviceDetect();
		const [authHeader, setAuthHeader] = useState<boolean>(false);
		useReactiveVar(userVar);

		const memoizedValues = useMemo(() => {
			let title = '';
			let desc = '';

			switch (router.pathname) {
				case '/mypage':
				case '/client/my-page':
					title = 'my page';
					desc = 'Fixora';
					break;
				case '/community':
					title = 'Community';
					desc = 'Fixora';
					break;
				case '/cs':
					title = 'CS';
					desc = 'Fixora';
					break;
				case '/account/join':
					title = 'Login/Signup';
					desc = 'Authentication Process';
					setAuthHeader(true);
					break;
				default:
					break;
			}

			return { title, desc };
		}, [router.pathname]);

		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		if (device == 'mobile') {
			return (
				<>
					<Head>
						<title>Fixora</title>
						<meta name={'title'} content={`Fixora`} />
					</Head>
					<Stack id="mobile-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
				</>
			);
		}

		return (
			<>
				<Head>
					<title>Fixora</title>
					<meta name={'title'} content={`Fixora`} />
				</Head>
				<Stack id="pc-wrap">
					<Stack id={'top'}>
						<Top />
					</Stack>

					<Stack className={`header-basic ${authHeader ? 'auth' : ''} header-basic--fixora`}>
						<Stack className={'container'}>
							<strong>{t(memoizedValues.title)}</strong>
							<span>{t(memoizedValues.desc)}</span>
						</Stack>
					</Stack>

					<Stack id={'main'}>
						<Component {...props} />
					</Stack>

					<Stack id={'footer'}>
						<Footer />
					</Stack>
				</Stack>
			</>
		);
	};
};

export default withLayoutBasic;
