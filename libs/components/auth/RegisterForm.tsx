import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import PersonOutlined from '@mui/icons-material/PersonOutlined';
import PhoneOutlined from '@mui/icons-material/PhoneOutlined';
import AddAPhotoOutlined from '@mui/icons-material/AddAPhotoOutlined';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { FixoraButton, FixoraInput } from '../ui';
import AuthHeading from './AuthHeading';
import AuthNavBack from './AuthNavBack';
import AuthDivider from './AuthDivider';
import SocialAuthRow from './SocialAuthRow';
import { buildNotificationSetupPayload } from '../notifications/NotificationSetupCard';
import AuthTelegramConnectStep from './AuthTelegramConnectStep';
import { fixoraCustomerSignup, isSignupConflictError, validateRegisterInput } from '../../auth/fixoraAuth';
import { DEFAULT_NOTIFICATION_SETUP } from '../../auth/notificationPreferencesCache';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { userVar } from '../../../apollo/store';
import { resolvePostAuthDestination } from '../../utils/postAuthDestination';
import { clearAuthTelegramPending, setAuthTelegramPending } from '../../auth/authTelegramFlow';
import { setAuthConfirmPending } from '../../auth/authConfirmFlow';

const RegisterForm = () => {
	const { t } = useTranslation('auth');
	const router = useRouter();
	const fileRef = useRef<HTMLInputElement>(null);
	const [fullName, setFullName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [photoFile, setPhotoFile] = useState<File | null>(null);
	const [photoFileName, setPhotoFileName] = useState('');
	const [photoPreview, setPhotoPreview] = useState<string | null>(null);
	const [termsAccepted, setTermsAccepted] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState(false);
	const [showTelegramStep, setShowTelegramStep] = useState(false);

	useEffect(() => {
		return () => {
			if (photoPreview) URL.revokeObjectURL(photoPreview);
		};
	}, [photoPreview]);

	const handlePhoto = (file: File | undefined) => {
		if (!file || !file.type.startsWith('image/')) return;
		setPhotoFile(file);
		setPhotoFileName(file.name);
		setPhotoPreview((prev) => {
			if (prev) URL.revokeObjectURL(prev);
			return URL.createObjectURL(file);
		});
	};

	const finishRegister = useCallback(async () => {
		clearAuthTelegramPending();
		const referrer = typeof router.query.referrer === 'string' ? router.query.referrer : null;
		await router.push(resolvePostAuthDestination(userVar(), referrer));
	}, [router]);

	const handleSubmit = useCallback(async () => {
		if (!termsAccepted) {
			setErrors({ terms: 'termsRequired' });
			return;
		}
		const result = validateRegisterInput(
			fullName,
			email,
			phone,
			password,
			confirmPassword,
			termsAccepted,
		);
		if (!result.valid) {
			setErrors(result.errors);
			return;
		}
		setErrors({});
		setLoading(true);
		setAuthTelegramPending();
		setAuthConfirmPending();
		try {
			const setupPayload = buildNotificationSetupPayload(DEFAULT_NOTIFICATION_SETUP);
			await fixoraCustomerSignup(fullName, email, password, phone, photoFile, setupPayload);
			setShowTelegramStep(true);
		} catch (err: unknown) {
			clearAuthTelegramPending();
			if (isSignupConflictError(err)) {
				setErrors(err.conflicts);
				return;
			}
			await sweetMixinErrorAlert(err instanceof Error ? err.message : 'Sign up failed');
		} finally {
			setLoading(false);
		}
	}, [fullName, email, phone, password, confirmPassword, termsAccepted, photoFile]);

	return (
		<>
			{!showTelegramStep && (
				<AuthNavBack label={t('register.backToRole')} onClick={() => void router.push('/register/role')} />
			)}
			<AuthHeading
				titleBefore={
					showTelegramStep ? t('authTelegram.headingBefore') : t('register.titleBefore')
				}
				titleAccent={
					showTelegramStep ? t('authTelegram.headingAccent') : t('register.titleAccent')
				}
				subtitle={
					showTelegramStep ? t('authTelegram.headingSubtitle') : t('register.subtitle')
				}
			/>
			<div className="auth-tech">
				{!showTelegramStep && (
					<>
						<input
							ref={fileRef}
							type="file"
							accept="image/*"
							hidden
							onChange={(e) => handlePhoto(e.target.files?.[0])}
						/>
						<div
							className={`auth-tech__photo${photoPreview ? ' auth-tech__photo--has-image' : ''}`}
							role="button"
							tabIndex={0}
							onClick={() => fileRef.current?.click()}
							onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
						>
							{photoPreview ? (
								<img src={photoPreview} alt="" className="auth-tech__photo-preview" />
							) : (
								<>
									<AddAPhotoOutlined />
									<span>{photoFileName || t('register.photoUpload')}</span>
								</>
							)}
						</div>
					</>
				)}
				<div className="auth-form">
					{!showTelegramStep && (
						<>
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
								label={t('register.phoneLabel')}
								type="tel"
								name="phone"
								autoComplete="tel"
								placeholder={t('register.phonePlaceholder')}
								icon={<PhoneOutlined fontSize="small" />}
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								error={!!errors.phone}
								helperText={errors.phone ? t(`validation.${errors.phone}`) : undefined}
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
								helperText={
									errors.confirmPassword
										? t(`validation.${errors.confirmPassword}`)
										: undefined
								}
								onKeyDown={(e) => e.key === 'Enter' && !loading && termsAccepted && handleSubmit()}
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
								<span className="fixora-input__helper fixora-input__helper--error">
									{t(`validation.${errors.terms}`)}
								</span>
							)}
							<FixoraButton
								variant="primary"
								fullWidth
								disabled={loading || !termsAccepted}
								onClick={handleSubmit}
							>
								{t('register.submit')}
								<ArrowForward fontSize="small" />
							</FixoraButton>
						</>
					)}
					{showTelegramStep && (
						<AuthTelegramConnectStep onContinue={() => void finishRegister()} />
					)}
				</div>
			</div>
			{!showTelegramStep && (
				<>
					<AuthDivider />
					<SocialAuthRow mode="register" />
					<div className="auth-footer">
						<button type="button" onClick={() => void router.push('/login')}>
							{t('register.backToLogin')}
						</button>
					</div>
				</>
			)}
		</>
	);
};

export default RegisterForm;
