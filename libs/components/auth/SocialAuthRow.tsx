import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { FixoraKakaoButton } from '../ui';
import { GoogleIcon, AppleIcon } from '../brand';
import { fixoraOAuthLogin } from '../../auth/fixoraAuth';
import { requestGoogleAuthCode } from '../../google-gis';
import { requestKakaoAccessToken } from '../../kakao-sdk';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { userVar } from '../../../apollo/store';
import { resolveAuthUser } from '../../utils/authSession';
import { getPostAuthRoute } from '../../utils/postAuthRoute';

const SocialAuthRow = ({ mode = 'login' }: { mode?: 'login' | 'register' }) => {
	const { t } = useTranslation('auth');
	const router = useRouter();
	const [loading, setLoading] = useState<'google' | 'kakao' | null>(null);
	const kakaoKey = mode === 'register' ? 'ui.signUpWithKakao' : 'ui.continueWithKakao';

	const routeAfterOAuth = useCallback(
		async (needsOnboarding: boolean, userType?: string) => {
			if (needsOnboarding) {
				await router.push('/register/role?oauth=1');
				return;
			}
			await router.push(getPostAuthRoute(resolveAuthUser() ?? { userType, memberType: userType }));
		},
		[router],
	);

	const oauthErrorMessage = useCallback(
		(err: unknown, provider: 'google' | 'kakao') => {
			const message = err instanceof Error ? err.message : String(err ?? '');
			if (/cancel/i.test(message)) return t('oauth.cancelled');
			if (/NEXT_PUBLIC_GOOGLE_CLIENT_ID|GOOGLE_NOT_CONFIGURED/i.test(message)) return t('oauth.googleNotConfigured');
			if (/NEXT_PUBLIC_KAKAO_JS_KEY|KAKAO_NOT_CONFIGURED/i.test(message)) return t('oauth.kakaoNotConfigured');
			if (/OAUTH_NOT_CONFIGURED|not configured on the server/i.test(message)) {
				return t('oauth.serverNotConfigured');
			}
			if (/INVALID_OAUTH|Invalid or expired OAuth token/i.test(message)) {
				return t('oauth.invalidToken');
			}
			if (/OAUTH_PROVIDER_MISMATCH/i.test(message)) {
				return t('oauth.providerMismatch');
			}
			if (/OAUTH_ACCOUNT_EXISTS|already exist/i.test(message)) {
				return t('oauth.accountExists');
			}
			if (message && !/^OAuth login failed/i.test(message) && message !== 'Request failed') {
				return message;
			}
			return provider === 'google' ? t('oauth.googleFailed') : t('oauth.kakaoFailed');
		},
		[t],
	);

	const handleGoogle = useCallback(async () => {
		const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
		if (!clientId) {
			await sweetMixinErrorAlert(t('oauth.googleNotConfigured'));
			return;
		}
		setLoading('google');
		try {
			const code = await requestGoogleAuthCode(clientId);
			const result = await fixoraOAuthLogin('GOOGLE', code);
			await routeAfterOAuth(result.needsOnboarding, result.userType);
		} catch (err: unknown) {
			await sweetMixinErrorAlert(oauthErrorMessage(err, 'google'));
		} finally {
			setLoading(null);
		}
	}, [oauthErrorMessage, routeAfterOAuth, t]);

	const handleKakao = useCallback(async () => {
		if (!process.env.NEXT_PUBLIC_KAKAO_JS_KEY) {
			await sweetMixinErrorAlert(t('oauth.kakaoNotConfigured'));
			return;
		}
		setLoading('kakao');
		try {
			const token = await requestKakaoAccessToken();
			const result = await fixoraOAuthLogin('KAKAO', token);
			await routeAfterOAuth(result.needsOnboarding, result.userType);
		} catch (err: unknown) {
			await sweetMixinErrorAlert(oauthErrorMessage(err, 'kakao'));
		} finally {
			setLoading(null);
		}
	}, [oauthErrorMessage, routeAfterOAuth, t]);

	const handleApple = useCallback(async () => {
		await sweetTopSmallSuccessAlert(t('oauth.comingSoon'), 1200);
	}, [t]);

	return (
		<div className="auth-social">
			<FixoraKakaoButton
				labelKey={kakaoKey}
				onClick={handleKakao}
				disabled={loading !== null}
			/>
			<div className="auth-social__row">
				<button
					type="button"
					className="auth-social__oauth"
					onClick={handleGoogle}
					disabled={loading !== null}
				>
					<GoogleIcon className="auth-social__oauth-icon" />
					Google
				</button>
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
