import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ThemeProvider, createTheme, ThemeOptions } from '@mui/material/styles';
import { fixoraDark } from '../../../scss/MaterialTheme';
import { getJwtToken, updateUserInfo } from '../../auth';
import { isAdminUser } from '../../utils/userRole';
import { useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_ADMIN_USER } from '../../../apollo/admin/query';
import { syncUserVarFromGraphqlUser } from '../../auth/syncUserVar';
import AdminSidebar from '../admin/AdminSidebar';
import AdminMobileTopBar from '../admin/AdminMobileTopBar';
import AdminForbidden from '../admin/AdminForbidden';
import useAdminMobileLayout from '../../hooks/useAdminMobileLayout';

const adminTheme = createTheme(fixoraDark as ThemeOptions);

export interface AdminPageProps {
	title?: string;
	subtitle?: string;
}

const withAdminLayout = <P extends object>(
	Component: React.ComponentType<P>,
	pageMeta?: { title?: string },
) => {
	const Wrapped = (props: P & AdminPageProps) => {
		const router = useRouter();
		const user = useReactiveVar(userVar);
		const isMobile = useAdminMobileLayout();
		const [authChecked, setAuthChecked] = useState(false);
		const [sidebarOpen, setSidebarOpen] = useState(false);

		useEffect(() => {
			const jwt = getJwtToken();
			if (!jwt) {
				router.replace(`/login?referrer=${encodeURIComponent(router.asPath)}`).then();
				return;
			}
			updateUserInfo(jwt);
			setAuthChecked(true);
		}, [router.asPath, router]);

		useEffect(() => {
			setSidebarOpen(false);
		}, [router.pathname]);

		useEffect(() => {
			if (!isMobile) setSidebarOpen(false);
		}, [isMobile]);

		useQuery(GET_ADMIN_USER, {
			variables: { userId: user._id },
			skip: !authChecked || !user._id,
			fetchPolicy: 'cache-and-network',
			onCompleted: (data) => {
				const profile = data?.getUser;
				if (profile?._id) syncUserVarFromGraphqlUser(profile);
			},
		});

		if (!authChecked) return null;

		const jwt = getJwtToken();
		if (!jwt) return null;

		if (user?._id && !isAdminUser(user)) {
			return (
				<ThemeProvider theme={adminTheme}>
					<AdminForbidden />
				</ThemeProvider>
			);
		}

		if (!user?._id) return null;

		const headTitle = pageMeta?.title ? `Fixora Admin — ${pageMeta.title}` : 'Fixora Admin Console';

		return (
			<ThemeProvider theme={adminTheme}>
				<Head>
					<title>{headTitle}</title>
					<meta name="title" content={headTitle} />
				</Head>
				<div className={`fixora-admin-layout${isMobile ? ' fixora-admin-layout--mobile' : ''}`}>
					{isMobile && (
						<AdminMobileTopBar
							sidebarOpen={sidebarOpen}
							onMenuToggle={() => setSidebarOpen((v) => !v)}
						/>
					)}
					{isMobile && sidebarOpen && (
						<button
							type="button"
							className="fixora-admin-mobile-overlay"
							onClick={() => setSidebarOpen(false)}
							aria-label="Close menu"
						/>
					)}
					<AdminSidebar
						className={sidebarOpen ? 'fixora-admin-sidebar--open' : ''}
						onNavigate={() => setSidebarOpen(false)}
					/>
					<main className="fixora-admin-main">
						<Component {...props} />
					</main>
				</div>
			</ThemeProvider>
		);
	};

	return Wrapped;
};

export default withAdminLayout;
