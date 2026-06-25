import type { AppProps } from 'next/app';
import { CssBaseline } from '@mui/material';
import React from 'react';
import { useRouter } from 'next/router';
import { ApolloProvider } from '@apollo/client';
import { useApollo } from '../apollo/client';
import { appWithTranslation } from 'next-i18next';
import AppShell from '../libs/components/layout/AppShell';
import { NotificationProvider } from '../libs/context/NotificationContext';
import FixoraSplashBackground from '../libs/components/background/FixoraSplashBackground';
import { FixoraThemeProvider } from '../libs/components/theme/FixoraThemeProvider';

import '../scss/app.scss';
import '../scss/pc/main.scss';
import '../scss/mobile/main.scss';
import '../scss/fixora-splash-background.scss';

const App = ({ Component, pageProps }: AppProps) => {
	const router = useRouter();
	const client = useApollo(pageProps.initialApolloState);

	return (
		<ApolloProvider client={client}>
			<NotificationProvider>
				<FixoraThemeProvider pathname={router.pathname}>
					<FixoraSplashBackground />
					<CssBaseline />
					<AppShell Component={Component} pageProps={pageProps} />
				</FixoraThemeProvider>
			</NotificationProvider>
		</ApolloProvider>
	);
};

export default appWithTranslation(App);
