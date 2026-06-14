import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import { Stack } from '@mui/material';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import TechnicianSidebar from '../technician/TechnicianSidebar';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const withTechnicianLayout = (Component: any) => {
	return (props: any) => {
		const router = useRouter();
		const device = useDeviceDetect();
		const user = useReactiveVar(userVar);

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		useEffect(() => {
			if (user?._id && user?.userType !== 'TECHNICIAN') {
				router.push('/').then();
			}
		}, [user]);

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
							<Stack id={'main'} className="fixora-technician-main">
								<Component {...props} />
							</Stack>
						</div>
						<Chat />
					</Stack>
				</>
			);
		}
	};
};

export default withTechnicianLayout;
