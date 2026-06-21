import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import PersonOutline from '@mui/icons-material/PersonOutline';
import BuildOutlined from '@mui/icons-material/BuildOutlined';
import PhoneOutlined from '@mui/icons-material/PhoneOutlined';
import ArrowForward from '@mui/icons-material/ArrowForward';
import AuthHeading from './AuthHeading';
import { FixoraButton, FixoraInput } from '../ui';
import {
	fixoraCompleteOAuthSignup,
	getNeedsOnboarding,
	validateOAuthCompleteInput,
} from '../../auth/fixoraAuth';
import { sweetMixinErrorAlert } from '../../sweetAlert';

const RoleSelect = () => {
	const { t } = useTranslation('auth');
	const router = useRouter();
	const isOAuth = router.query.oauth === '1' || getNeedsOnboarding();
	const [selectedType, setSelectedType] = useState<'USER' | 'TECHNICIAN' | null>(null);
	const [nickname, setNickname] = useState('');
	const [phone, setPhone] = useState('');
	const [termsAccepted, setTermsAccepted] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState(false);

	const handleRolePick = (type: 'USER' | 'TECHNICIAN') => {
		if (isOAuth) {
			setSelectedType(type);
			return;
		}
		if (type === 'USER') router.push('/register');
		else router.push('/register/technician/1');
	};

	const handleOAuthComplete = useCallback(async () => {
		if (!selectedType) return;
		const result = validateOAuthCompleteInput(nickname, phone, termsAccepted);
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
			});
			if (userType === 'TECHNICIAN') {
				await router.push('/register/technician/id');
			} else {
				await router.push('/');
			}
		} catch (err: any) {
			await sweetMixinErrorAlert(err?.message ?? 'Signup failed');
		} finally {
			setLoading(false);
		}
	}, [nickname, phone, termsAccepted, selectedType, router]);

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
