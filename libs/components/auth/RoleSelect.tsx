import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useApolloClient } from '@apollo/client';
import PersonOutline from '@mui/icons-material/PersonOutline';
import BuildOutlined from '@mui/icons-material/BuildOutlined';
import PhoneOutlined from '@mui/icons-material/PhoneOutlined';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import ArrowForward from '@mui/icons-material/ArrowForward';
import AuthHeading from './AuthHeading';
import { FixoraButton, FixoraInput } from '../ui';
import NotificationSetupCard from '../notifications/NotificationSetupCard';
import {
	fixoraCompleteOAuthSignup,
	getNeedsOnboarding,
	isSignupConflictError,
	resolveOAuthStubEmail,
	validateOAuthCompleteInput,
} from '../../auth/fixoraAuth';
import { readOAuthSignupRole, saveOAuthSignupRole } from '../../auth/oauthSignupRole';
import { applyNotificationPreferences } from '../../auth/applyNotificationPreferences';
import {
	DEFAULT_NOTIFICATION_PREFERENCES,
	NotificationPreferences,
	writeNotificationPreferencesCache,
} from '../../auth/notificationPreferencesCache';
import { UPDATE_NOTIFICATION_PREFERENCES } from '../../../apollo/user/settings';
import { userVar } from '../../../apollo/store';
import { sweetMixinErrorAlert } from '../../sweetAlert';

const RoleSelect = () => {
	const { t } = useTranslation('auth');
	const router = useRouter();
	const apolloClient = useApolloClient();
	const isOAuth = router.query.oauth === '1' || getNeedsOnboarding();
	const oauthStubEmail = useMemo(() => (isOAuth ? resolveOAuthStubEmail() : ''), [isOAuth]);
	const needsEmail = isOAuth && !oauthStubEmail;
	const [selectedType, setSelectedType] = useState<'USER' | 'TECHNICIAN' | null>(null);
	const [nickname, setNickname] = useState('');
	const [email, setEmail] = useState(oauthStubEmail);
	const [phone, setPhone] = useState('');
	const [termsAccepted, setTermsAccepted] = useState(false);
	const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>(
		DEFAULT_NOTIFICATION_PREFERENCES,
	);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!isOAuth) return;
		const savedRole = readOAuthSignupRole();
		if (savedRole) setSelectedType(savedRole);
	}, [isOAuth]);

	const applyNotificationPrefs = async (userId: string) => {
		await applyNotificationPreferences(apolloClient, userId, notificationPrefs);
	};

	const handleRolePick = (type: 'USER' | 'TECHNICIAN') => {
		saveOAuthSignupRole(type);
		if (isOAuth) {
			setSelectedType(type);
			return;
		}
		if (type === 'USER') router.push('/register');
		else router.push('/register/technician/1');
	};

	const handleOAuthComplete = useCallback(async () => {
		if (!selectedType) return;
		const result = validateOAuthCompleteInput(nickname, phone, termsAccepted, {
			email,
			emailRequired: needsEmail,
		});
		if (!result.valid) {
			setErrors(result.errors);
			return;
		}
		setErrors({});
		setLoading(true);
		try {
			const userType = await fixoraCompleteOAuthSignup({
				userNickname: nickname.trim(),
				userPhoneNumber: phone.trim(),
				userType: selectedType,
				...(needsEmail || email.trim() ? { userEmail: email.trim() } : {}),
			});
			const userId = userVar()._id;
			if (userId) await applyNotificationPrefs(userId);
			if (userType === 'TECHNICIAN') {
				await router.push('/onboarding/technician');
			} else {
				await router.push('/onboarding/customer');
			}
		} catch (err: unknown) {
			if (isSignupConflictError(err)) {
				setErrors(err.conflicts);
				return;
			}
			const message = err instanceof Error ? err.message : '';
			if (/required signup field|missing/i.test(message)) {
				setErrors({ email: 'emailRequired' });
				await sweetMixinErrorAlert(t('oauthComplete.emailRequiredHint'));
				return;
			}
			await sweetMixinErrorAlert(message || 'Signup failed');
		} finally {
			setLoading(false);
		}
	}, [email, needsEmail, nickname, phone, termsAccepted, selectedType, router, notificationPrefs, apolloClient, t]);

	return (
		<>
			<AuthHeading
				titleBefore={t('role.titleBefore')}
				titleAccent={t('role.titleAccent')}
				subtitle={t('role.subtitle')}
			/>
			{!selectedType ? (
				<div className="auth-role">
					<button type="button" className="auth-role__card" onClick={() => handleRolePick('USER')}>
						<PersonOutline />
						<h3>{t('role.customerTitle')}</h3>
						<p>{t('role.customerDesc')}</p>
					</button>
					<button type="button" className="auth-role__card" onClick={() => handleRolePick('TECHNICIAN')}>
						<BuildOutlined />
						<h3>{t('role.technicianTitle')}</h3>
						<p>{t('role.technicianDesc')}</p>
					</button>
				</div>
			) : (
				<div className="auth-form">
					<p>{selectedType === 'USER' ? t('role.customerTitle') : t('role.technicianTitle')}</p>
					<FixoraInput
						label={t('oauthComplete.nicknameLabel')}
						name="nickname"
						placeholder={t('oauthComplete.nicknamePlaceholder')}
						icon={<PersonOutline fontSize="small" />}
						value={nickname}
						onChange={(e) => setNickname(e.target.value)}
						error={!!errors.nickname}
						helperText={errors.nickname ? t(`validation.${errors.nickname}`) : undefined}
					/>
					{needsEmail && (
						<FixoraInput
							label={t('oauthComplete.emailLabel')}
							type="email"
							name="email"
							autoComplete="email"
							placeholder={t('oauthComplete.emailPlaceholder')}
							icon={<EmailOutlined fontSize="small" />}
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							error={!!errors.email}
							helperText={
								errors.email
									? t(`validation.${errors.email}`)
									: t('oauthComplete.emailHint')
							}
						/>
					)}
					<FixoraInput
						label={t('oauthComplete.phoneLabel')}
						type="tel"
						name="phone"
						placeholder={t('oauthComplete.phonePlaceholder')}
						icon={<PhoneOutlined fontSize="small" />}
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
						error={!!errors.phone}
						helperText={errors.phone ? t(`validation.${errors.phone}`) : undefined}
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
					<NotificationSetupCard prefs={notificationPrefs} onChange={setNotificationPrefs} />
					<FixoraButton variant="primary" fullWidth disabled={loading} onClick={handleOAuthComplete}>
						{t('oauthComplete.submit')}
						<ArrowForward fontSize="small" />
					</FixoraButton>
				</div>
			)}
			<div className="auth-footer">
				<button type="button" onClick={() => router.push('/login')}>
					{t('register.logIn')}
				</button>
			</div>
		</>
	);
};

export default RoleSelect;
