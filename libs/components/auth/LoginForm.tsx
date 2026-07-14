import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { FixoraButton, FixoraInput } from '../ui';
import AuthHeading from './AuthHeading';
import AuthDivider from './AuthDivider';
import SocialAuthRow from './SocialAuthRow';
import AuthTelegramConnectStep from './AuthTelegramConnectStep';
import { fixoraLogin, validateLoginInput } from '../../auth/fixoraAuth';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { resolveAuthUser } from '../../utils/authSession';
import { resolvePostAuthDestination } from '../../utils/postAuthDestination';
import { routePathsEqual } from '../../utils/routePaths';
import { clearAuthTelegramPending, setAuthTelegramPending } from '../../auth/authTelegramFlow';

const LoginForm = () => {
	const { t } = useTranslation('auth');
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [remember, setRemember] = useState(true);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState(false);
	const [showTelegramStep, setShowTelegramStep] = useState(false);
	const oauthHint = router.query.oauthError === 'provider_mismatch';

	const finishAuth = useCallback(async () => {
		clearAuthTelegramPending();
		const referrer = typeof router.query.referrer === 'string' ? router.query.referrer : null;
		const target = resolvePostAuthDestination(resolveAuthUser(), referrer);
		if (!routePathsEqual(router.pathname, target)) {
			await router.replace(target);
		}
	}, [router]);

	/** After token is set — stay on page for optional Telegram connect */
	const enterTelegramStepOrFinish = useCallback(() => {
		setAuthTelegramPending();
		setShowTelegramStep(true);
	}, []);

	const handleSubmit = useCallback(async () => {
		const result = validateLoginInput(email, password);
		if (!result.valid) {
			setErrors(result.errors);
			return;
		}
		setErrors({});
		setLoading(true);
		setAuthTelegramPending();
		try {
			await fixoraLogin(email, password);
			setShowTelegramStep(true);
		} catch (err: any) {
			clearAuthTelegramPending();
			await sweetMixinErrorAlert(err?.message ?? 'Login failed');
		} finally {
			setLoading(false);
		}
	}, [email, password]);

	if (showTelegramStep) {
		return (
			<>
				<AuthHeading
					titleBefore={t('authTelegram.headingBefore')}
					titleAccent={t('authTelegram.headingAccent')}
					subtitle={t('authTelegram.headingSubtitle')}
				/>
				<AuthTelegramConnectStep onContinue={() => void finishAuth()} />
			</>
		);
	}

	return (
		<>
			<AuthHeading
				titleBefore={t('login.titleBefore')}
				titleAccent={t('login.titleAccent')}
				subtitle={t('login.subtitle')}
			/>
			<div className="auth-form">
				{oauthHint && (
					<p className="auth-form__hint auth-form__hint--warning" role="status">
						{t('oauth.providerMismatchUseEmail')}
					</p>
				)}
				<FixoraInput
					label={t('login.emailLabel')}
					type="email"
					name="email"
					autoComplete="email"
					placeholder={t('login.emailPlaceholder')}
					icon={<EmailOutlined fontSize="small" />}
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					error={!!errors.email}
					helperText={errors.email ? t(`validation.${errors.email}`) : undefined}
					onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
				/>
				<FixoraInput
					label={t('login.passwordLabel')}
					type="password"
					name="password"
					autoComplete="current-password"
					placeholder={t('login.passwordPlaceholder')}
					icon={<LockOutlined fontSize="small" />}
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					error={!!errors.password}
					helperText={errors.password ? t(`validation.${errors.password}`) : undefined}
					onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
				/>
				<div className="auth-form__row">
					<label className="auth-form__checkbox">
						<input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
						<span>{t('login.rememberMe')}</span>
					</label>
					<button type="button" className="auth-form__link" onClick={() => router.push('/login/forgot')}>
						{t('login.forgotPassword')}
					</button>
				</div>
				<FixoraButton variant="primary" fullWidth disabled={loading} onClick={handleSubmit}>
					{t('login.submit')}
					<ArrowForward fontSize="small" />
				</FixoraButton>
			</div>
			<AuthDivider />
			<SocialAuthRow mode="login" onLoginSuccess={enterTelegramStepOrFinish} />
			<div className="auth-footer">
				{t('login.noAccount')}{' '}
				<button type="button" onClick={() => router.push('/register/role')}>
					{t('login.signUp')}
				</button>
			</div>
		</>
	);
};

export default LoginForm;
