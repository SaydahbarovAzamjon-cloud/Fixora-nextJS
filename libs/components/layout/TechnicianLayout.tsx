import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import { Stack } from '@mui/material';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import TechnicianSidebar from '../technician/TechnicianSidebar';
import Header from '../technician/Header';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const withTechnicianLayout = (Component: any) => {
	return (props: any) => {
		const router = useRouter();
		const device = useDeviceDetect();
		const user = useReactiveVar(userVar);

		const activePage = useMemo(() => {
			const path = router.pathname;
			if (path.includes('/dashboard')) return 'dashboard';
			if (path.includes('/requests')) return 'requests';
			if (path.includes('/jobs')) return 'jobs';
			if (path.includes('/messages')) return 'messages';
			if (path.includes('/notifications')) return 'notifications';
			if (path.includes('/profile')) return 'profile';
			if (path.includes('/analytics')) return 'analytics';
			if (path.includes('/earnings')) return 'earnings';
			if (path.includes('/settings')) return 'settings';
			if (path.includes('/write')) return 'write';
			if (path.includes('/articles')) return 'articles';
			if (path.includes('/help')) return 'help';
			return 'dashboard';
		}, [router.pathname]);

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		useEffect(() => {
			const jwt = getJwtToken();
			if (!jwt) {
				router.replace(`/login?referrer=${encodeURIComponent(router.asPath)}`).then();
				return;
			}
			if (user?._id && user?.memberType !== 'TECHNICIAN') {
				router.replace('/').then();
			}
		}, [user, router.asPath]);

		if (device == 'mobile') {
			return (
				<>
					<Head>
						<title>Fixora - Technician Dashboard</title>
						<meta name={'title'} content={`Fixora - Technician Dashboard`} />
					</Head>
					<Stack id="mobile-wrap" className="fixora-technician-mobile">
						<Stack id={'main'}>
							<Component {...props} />
						</Stack>
					</Stack>
				</>
			);
		} else {
			return (
				<>
					<Head>
						<title>Fixora - Technician Dashboard</title>
						<meta name={'title'} content={`Fixora - Technician Dashboard`} />
					</Head>
					<Stack id="pc-wrap" className="fixora-technician-layout">
						<div className="fixora-technician-container">
							<TechnicianSidebar />
							<div className="fixora-technician-main-wrapper">
								<Header activePage={activePage} />
								<Stack id={'main'} className="fixora-technician-main">
									<Component {...props} />
								</Stack>
							</div>
						</div>
						<Chat />
					</Stack>
				</>
			);
		}
	};
};

export default withTechnicianLayout;
