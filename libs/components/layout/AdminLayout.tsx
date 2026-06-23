import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Menu } from 'lucide-react';
import { ThemeProvider, createTheme, ThemeOptions } from '@mui/material/styles';
import { fixoraDark } from '../../../scss/MaterialTheme';
import { getJwtToken, updateUserInfo } from '../../auth';
import { isAdminUser } from '../../utils/userRole';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import AdminSidebar from '../admin/AdminSidebar';
import AdminForbidden from '../admin/AdminForbidden';
import useDeviceDetect from '../../hooks/useDeviceDetect';

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
		const device = useDeviceDetect();
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
				<div className="fixora-admin-layout">
					{device === 'mobile' && (
						<button
							type="button"
							className="fixora-admin-mobile-menu"
							onClick={() => setSidebarOpen((v) => !v)}
							aria-label="Menu"
						>
							<Menu size={20} />
						</button>
					)}
					{device === 'mobile' && sidebarOpen && (
						<button
							type="button"
							className="fixora-admin-mobile-overlay"
							onClick={() => setSidebarOpen(false)}
							aria-label="Close menu"
						/>
					)}
					<AdminSidebar className={sidebarOpen ? 'fixora-admin-sidebar--open' : ''} />
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
