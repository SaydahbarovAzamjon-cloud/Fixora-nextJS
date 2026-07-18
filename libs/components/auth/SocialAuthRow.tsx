import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { FixoraKakaoButton } from '../ui';
import { GoogleIcon, AppleIcon } from '../brand';
import { fixoraOAuthLogin, revertOAuthSignupSession } from '../../auth/fixoraAuth';
import { readOAuthSignupRole } from '../../auth/oauthSignupRole';
import { getJwtToken } from '../../auth/tokens';
import { startGoogleAuth } from '../../google-gis';
import { requestKakaoAccessToken } from '../../kakao-sdk';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { resolveAuthUser } from '../../utils/authSession';
import { resolvePostAuthDestination } from '../../utils/postAuthDestination';
import { getGraphQLErrorMessage, isOAuthProviderMismatchError } from '../../utils/oauthErrors';
import { setAuthTelegramPending } from '../../auth/authTelegramFlow';
import { setAuthConfirmPending } from '../../auth/authConfirmFlow';

type OAuthProvider = 'google' | 'kakao';

const SocialAuthRow = ({
	mode = 'login',
	onLoginSuccess,
}: {
	mode?: 'login' | 'register';
	/** Login mode: after OAuth session is set — return true if you handled navigation */
	onLoginSuccess?: () => void | Promise<void>;
}) => {
	const { t } = useTranslation('auth');
	const { t: tCommon } = useTranslation('common');
	const router = useRouter();
	const mountedRef = useRef(true);
	const [loading, setLoading] = useState<OAuthProvider | null>(null);
	const kakaoKey = mode === 'register' ? 'ui.signUpWithKakao' : 'ui.continueWithKakao';
	const googleKey = mode === 'register' ? 'ui.signUpWithGoogle' : 'ui.continueWithGoogle';

	useEffect(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
		};
	}, []);

	const ensureSignupRole = useCallback(async (): Promise<boolean> => {
		if (mode !== 'register') return true;
		if (readOAuthSignupRole()) return true;
		await sweetMixinErrorAlert(t('oauth.chooseRoleFirst'));
		await router.push('/register/role');
		return false;
	}, [mode, router, t]);

	const routeAfterOAuth = useCallback(
		async (needsOnboarding: boolean, provider: OAuthProvider, userType?: string) => {
			if (mode === 'register' && !needsOnboarding) {
				revertOAuthSignupSession();
				await sweetMixinErrorAlert(
					provider === 'google'
						? t('oauth.googleAlreadyRegistered')
						: t('oauth.kakaoAlreadyRegistered'),
				);
				return;
			}

			if (needsOnboarding) {
				await router.push('/register/role?oauth=1');
				return;
			}

			if (mode === 'login' && onLoginSuccess) {
				await onLoginSuccess();
				return;
			}

			await router.push(
				resolvePostAuthDestination(resolveAuthUser() ?? { userType, memberType: userType }),
			);
		},
		[mode, onLoginSuccess, router, t],
	);

	const oauthErrorMessage = useCallback(
		(err: unknown, provider: OAuthProvider) => {
			const message = getGraphQLErrorMessage(err);
			if (/cancel/i.test(message)) return t('oauth.cancelled');
			if (/timed out/i.test(message)) return t('oauth.kakaoFailed');
			if (/NEXT_PUBLIC_GOOGLE_CLIENT_ID|GOOGLE_NOT_CONFIGURED/i.test(message)) return t('oauth.googleNotConfigured');
			if (/NEXT_PUBLIC_KAKAO_JS_KEY|KAKAO_NOT_CONFIGURED/i.test(message)) return t('oauth.kakaoNotConfigured');
			if (/OAUTH_NOT_CONFIGURED|not configured on the server/i.test(message)) {
				return t('oauth.serverNotConfigured');
			}
			if (/INVALID_OAUTH|Invalid or expired OAuth token/i.test(message)) {
				return t('oauth.invalidToken');
			}
			if (isOAuthProviderMismatchError(err)) {
				return mode === 'login' ? t('oauth.providerMismatchUseEmail') : t('oauth.providerMismatch');
			}
			if (/OAUTH_ACCOUNT_EXISTS|already exist/i.test(message)) {
				return mode === 'register'
					? provider === 'google'
						? t('oauth.googleAlreadyRegistered')
						: t('oauth.kakaoAlreadyRegistered')
					: t('oauth.accountExists');
			}
			if (message && !/^OAuth login failed/i.test(message) && message !== 'Request failed') {
				return message;
			}
			return provider === 'google' ? t('oauth.googleFailed') : t('oauth.kakaoFailed');
		},
		[mode, t],
	);

	const handleProviderMismatch = useCallback(async () => {
		if (mode === 'login') {
			await router.replace('/login?oauthError=provider_mismatch', undefined, { shallow: true });
		}
	}, [mode, router]);

	const showOAuthError = useCallback(
		async (err: unknown, provider: OAuthProvider) => {
			if (!mountedRef.current) return;
			if (mode === 'register') {
				revertOAuthSignupSession();
			} else if (getJwtToken()) {
				return;
			}
			if (isOAuthProviderMismatchError(err)) {
				await handleProviderMismatch();
			}
			await sweetMixinErrorAlert(oauthErrorMessage(err, provider));
		},
		[handleProviderMismatch, mode, oauthErrorMessage],
	);

	const runOAuth = useCallback(
		async (provider: OAuthProvider, token: string) => {
			if (mode === 'login' || mode === 'register') {
				setAuthTelegramPending();
				setAuthConfirmPending();
			}
			const result = await fixoraOAuthLogin(
				provider === 'google' ? 'GOOGLE' : 'KAKAO',
				token,
				{ registerMode: mode === 'register' },
			);
			await routeAfterOAuth(result.needsOnboarding, provider, result.userType);
		},
		[mode, routeAfterOAuth],
	);

	const handleGoogle = useCallback(async () => {
		const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
		if (!clientId) {
			await sweetMixinErrorAlert(t('oauth.googleNotConfigured'));
			return;
		}
		if (!(await ensureSignupRole())) return;

		setLoading('google');
		try {
			const result = await startGoogleAuth(clientId, {
				mode,
				returnTo: router.asPath || (mode === 'register' ? '/register' : '/login'),
			});
			// Mobile / in-app: full-page redirect — callback page finishes OAuth.
			if (result.type === 'redirect') return;
			await runOAuth('google', result.code);
		} catch (err: unknown) {
			await showOAuthError(err, 'google');
		} finally {
			setLoading(null);
		}
	}, [ensureSignupRole, mode, router.asPath, runOAuth, showOAuthError, t]);

	const handleKakao = useCallback(async () => {
		if (!process.env.NEXT_PUBLIC_KAKAO_JS_KEY) {
			await sweetMixinErrorAlert(t('oauth.kakaoNotConfigured'));
			return;
		}
		if (!(await ensureSignupRole())) return;

		setLoading('kakao');
		try {
			const token = await requestKakaoAccessToken();
			await runOAuth('kakao', token);
		} catch (err: unknown) {
			await showOAuthError(err, 'kakao');
		} finally {
			setLoading(null);
		}
	}, [ensureSignupRole, runOAuth, showOAuthError, t]);

	const handleApple = useCallback(async () => {
		await sweetTopSmallSuccessAlert(t('oauth.comingSoon'), 1200);
	}, [t]);

	const googleButton = (
		<button
			type="button"
			className={`auth-social__oauth${mode === 'register' ? ' auth-social__oauth--full' : ''}`}
			onClick={handleGoogle}
			disabled={loading !== null}
		>
			<GoogleIcon className="auth-social__oauth-icon" />
			{tCommon(googleKey)}
		</button>
	);

	return (
		<div className="auth-social">
			<FixoraKakaoButton labelKey={kakaoKey} onClick={handleKakao} disabled={loading !== null} />
			{mode === 'register' ? googleButton : null}
			<div className="auth-social__row">
				{mode === 'login' ? googleButton : null}
				<button type="button" className="auth-social__oauth" onClick={handleApple} disabled={loading !== null}>
					<AppleIcon className="auth-social__oauth-icon auth-social__oauth-icon--apple" />
					Apple
					<span className="auth-social__oauth-badge">{t('oauth.comingSoon')}</span>
				</button>
			</div>
		</div>
	);
};

export default SocialAuthRow;
