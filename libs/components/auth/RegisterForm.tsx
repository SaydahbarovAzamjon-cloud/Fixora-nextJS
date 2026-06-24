import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import PersonOutlined from '@mui/icons-material/PersonOutlined';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { FixoraButton, FixoraInput } from '../ui';
import AuthHeading from './AuthHeading';
import AuthDivider from './AuthDivider';
import SocialAuthRow from './SocialAuthRow';
import { fixoraCustomerSignup, isSignupConflictError, validateRegisterInput } from '../../auth/fixoraAuth';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { userVar } from '../../../apollo/store';
import { getPostAuthRoute } from '../../utils/postAuthRoute';

const RegisterForm = () => {
	const { t } = useTranslation('auth');
	const router = useRouter();
	const [fullName, setFullName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [termsAccepted, setTermsAccepted] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState(false);

	const handleSubmit = useCallback(async () => {
		const result = validateRegisterInput(fullName, email, password, confirmPassword, termsAccepted);
		if (!result.valid) {
			setErrors(result.errors);
			return;
		}
		setErrors({});
		setLoading(true);
		try {
			await fixoraCustomerSignup(fullName, email, password);
			const referrer = typeof router.query.referrer === 'string' ? router.query.referrer : null;
			await router.push(getPostAuthRoute(userVar(), referrer));
		} catch (err: unknown) {
			if (isSignupConflictError(err)) {
				setErrors(err.conflicts);
				return;
			}
			await sweetMixinErrorAlert(err instanceof Error ? err.message : 'Sign up failed');
		} finally {
			setLoading(false);
		}
	}, [fullName, email, password, confirmPassword, termsAccepted, router]);

	return (
		<>
			<AuthHeading
				titleBefore={t('register.titleBefore')}
				titleAccent={t('register.titleAccent')}
				subtitle={t('register.subtitle')}
			/>
			<div className="auth-form">
				<FixoraInput
					label={t('register.fullNameLabel')}
					type="text"
					name="fullName"
					autoComplete="name"
					placeholder={t('register.fullNamePlaceholder')}
					icon={<PersonOutlined fontSize="small" />}
					value={fullName}
					onChange={(e) => setFullName(e.target.value)}
					error={!!errors.fullName}
					helperText={errors.fullName ? t(`validation.${errors.fullName}`) : undefined}
				/>
				<FixoraInput
					label={t('register.emailLabel')}
					type="email"
					name="email"
					autoComplete="email"
					placeholder={t('register.emailPlaceholder')}
					icon={<EmailOutlined fontSize="small" />}
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					error={!!errors.email}
					helperText={errors.email ? t(`validation.${errors.email}`) : undefined}
				/>
				<FixoraInput
					label={t('register.passwordLabel')}
					type="password"
					name="password"
					autoComplete="new-password"
					placeholder={t('register.passwordPlaceholder')}
					icon={<LockOutlined fontSize="small" />}
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					error={!!errors.password}
					helperText={errors.password ? t(`validation.${errors.password}`) : undefined}
				/>
				{password.length > 0 && (
					<div className="auth-form__hint">
						<CheckCircleOutline fontSize="small" />
						{t('register.passwordHint')}
					</div>
				)}
				<FixoraInput
					label={t('register.confirmLabel')}
					type="password"
					name="confirmPassword"
					autoComplete="new-password"
					placeholder={t('register.confirmPlaceholder')}
					icon={<LockOutlined fontSize="small" />}
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
					error={!!errors.confirmPassword}
					helperText={errors.confirmPassword ? t(`validation.${errors.confirmPassword}`) : undefined}
					onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
				/>
				<label className="auth-form__checkbox">
					<input
						type="checkbox"
						checked={termsAccepted}
						onChange={(e) => setTermsAccepted(e.target.checked)}
					/>
					<span>
						{t('register.termsPrefix')}{' '}
						<a href="/cs">{t('register.termsLink')}</a> {t('register.termsAnd')}{' '}
						<a href="/cs">{t('register.privacyLink')}</a>
					</span>
				</label>
				{errors.terms && (
					<span className="fixora-input__helper fixora-input__helper--error">{t(`validation.${errors.terms}`)}</span>
				)}
				<FixoraButton variant="primary" fullWidth disabled={loading} onClick={handleSubmit}>
					{t('register.submit')}
					<ArrowForward fontSize="small" />
				</FixoraButton>
			</div>
			<AuthDivider />
			<SocialAuthRow mode="register" />
			<div className="auth-footer">
				{t('register.hasAccount')}{' '}
				<button type="button" onClick={() => router.push('/login')}>
					{t('register.logIn')}
				</button>
			</div>
		</>
	);
};

export default RegisterForm;
