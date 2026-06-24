import type { AppProps } from 'next/app';
import { CssBaseline } from '@mui/material';
import React from 'react';
import { useRouter } from 'next/router';
import { ApolloProvider } from '@apollo/client';
import { useApollo } from '../apollo/client';
import { appWithTranslation } from 'next-i18next';
import AppShell from '../libs/components/layout/AppShell';
import FixoraWebSocketBridge from '../libs/components/FixoraWebSocketBridge';
import { FixoraThemeProvider } from '../libs/components/theme/FixoraThemeProvider';

import '../scss/app.scss';
import '../scss/pc/main.scss';
import '../scss/mobile/main.scss';

const App = ({ Component, pageProps }: AppProps) => {
	const router = useRouter();
	const client = useApollo(pageProps.initialApolloState);

	return (
		<ApolloProvider client={client}>
			<FixoraThemeProvider pathname={router.pathname}>
				<CssBaseline />
				<FixoraWebSocketBridge />
				<AppShell Component={Component} pageProps={pageProps} />
			</FixoraThemeProvider>
		</ApolloProvider>
	);
};

export default appWithTranslation(App);
