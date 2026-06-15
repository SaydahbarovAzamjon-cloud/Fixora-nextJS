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
import { fixoraLogin, validateLoginInput } from '../../auth/fixoraAuth';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { userVar } from '../../../apollo/store';

const LoginForm = () => {
	const { t } = useTranslation('auth');
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [remember, setRemember] = useState(true);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState(false);

	const handleSubmit = useCallback(async () => {
		const result = validateLoginInput(email, password);
		if (!result.valid) {
			setErrors(result.errors);
			return;
		}
		setErrors({});
		setLoading(true);
		try {
			await fixoraLogin(email, password);
			const user = userVar();
			const destination = user?.memberType === 'TECHNICIAN' ? '/technician/dashboard' : (typeof router.query.referrer === 'string' ? router.query.referrer : '/');
			await router.push(destination);
		} catch (err: any) {
			await sweetMixinErrorAlert(err?.message ?? 'Login failed');
		} finally {
			setLoading(false);
		}
	}, [email, password, router]);

	return (
		<>
			<AuthHeading
				titleBefore={t('login.titleBefore')}
				titleAccent={t('login.titleAccent')}
				subtitle={t('login.subtitle')}
			/>
			<div className="auth-form">
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
			<SocialAuthRow mode="login" />
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
