import { useEffect, useRef, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import withLayoutAuth from '../../libs/components/layout/LayoutAuth';
import { AuthShell, AuthHeading } from '../../libs/components/auth';
import {
	clearGoogleOAuthPending,
	decodeGoogleOAuthState,
	parseGoogleRedirectCallback,
	readGoogleOAuthPending,
} from '../../libs/google-gis';
import { fixoraOAuthLogin, revertOAuthSignupSession } from '../../libs/auth/fixoraAuth';
import { resolveAuthUser } from '../../libs/utils/authSession';
import { resolvePostAuthDestination } from '../../libs/utils/postAuthDestination';
import { getGraphQLErrorMessage, isOAuthProviderMismatchError } from '../../libs/utils/oauthErrors';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { setAuthTelegramPending } from '../../libs/auth/authTelegramFlow';
import { setAuthConfirmPending } from '../../libs/auth/authConfirmFlow';

export const getStaticProps = async ({ locale }: { locale: string }) => ({
	props: {
		...(await serverSideTranslations(locale, ['common', 'auth'])),
	},
});

/**
 * Google OAuth redirect landing page (mobile / in-app browsers).
 * Desktop Google login still uses popup + postmessage.
 */
const GoogleOAuthCallbackPage: NextPage = () => {
	const { t } = useTranslation('auth');
	const router = useRouter();
	const startedRef = useRef(false);
	const [status, setStatus] = useState<'working' | 'error'>('working');

	useEffect(() => {
		if (!router.isReady || startedRef.current) return;
		startedRef.current = true;

		const run = async () => {
			const { code, error, state } = parseGoogleRedirectCallback(window.location.search);
			const pending =
				decodeGoogleOAuthState(state) || readGoogleOAuthPending() || undefined;

			// Drop OAuth params from the address bar ASAP.
			void router.replace('/oauth/google', undefined, { shallow: true });

			if (error || !code) {
				clearGoogleOAuthPending();
				setStatus('error');
				await sweetMixinErrorAlert(
					error === 'access_denied' ? t('oauth.cancelled') : t('oauth.googleFailed'),
				);
				await router.replace(pending?.returnTo || '/login');
				return;
			}

			const mode = pending?.mode ?? 'login';
			clearGoogleOAuthPending();

			try {
				setAuthTelegramPending();
				setAuthConfirmPending();
				const result = await fixoraOAuthLogin('GOOGLE', code, {
					registerMode: mode === 'register',
				});

				if (mode === 'register' && !result.needsOnboarding) {
					revertOAuthSignupSession();
					await sweetMixinErrorAlert(t('oauth.googleAlreadyRegistered'));
					await router.replace('/login');
					return;
				}

				if (result.needsOnboarding) {
					await router.replace('/register/role?oauth=1');
					return;
				}

				await router.replace(
					resolvePostAuthDestination(
						resolveAuthUser() ?? { userType: result.userType, memberType: result.userType },
					),
				);
			} catch (err: unknown) {
				setStatus('error');
				if (mode === 'register') {
					revertOAuthSignupSession();
				}
				let message = t('oauth.googleFailed');
				if (isOAuthProviderMismatchError(err)) {
					message =
						mode === 'login' ? t('oauth.providerMismatchUseEmail') : t('oauth.providerMismatch');
				} else {
					const raw = getGraphQLErrorMessage(err);
					if (
						raw &&
						!/^OAuth login failed/i.test(raw) &&
						raw !== 'Request failed' &&
						!/is not a function|Cannot read|TypeError|ReferenceError|requestCode|undefined is not/i.test(
							raw,
						)
					) {
						message = raw;
					}
				}
				await sweetMixinErrorAlert(message);
				await router.replace(pending?.returnTo || (mode === 'register' ? '/register' : '/login'));
			}
		};

		void run();
	}, [router, t]);

	return (
		<AuthShell>
			<AuthHeading
				titleBefore={status === 'error' ? t('oauth.googleFailed') : t('login.titleBefore')}
				titleAccent={status === 'error' ? '' : t('login.titleAccent')}
				subtitle={status === 'error' ? t('oauth.googleFailed') : t('oauth.googleRedirectWait')}
			/>
		</AuthShell>
	);
};

export default withLayoutAuth(GoogleOAuthCallbackPage, 'meta.loginTitle');
