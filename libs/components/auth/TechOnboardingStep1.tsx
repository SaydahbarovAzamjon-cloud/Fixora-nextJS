import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import PersonOutlined from '@mui/icons-material/PersonOutlined';
import PhoneOutlined from '@mui/icons-material/PhoneOutlined';
import AddAPhotoOutlined from '@mui/icons-material/AddAPhotoOutlined';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { FixoraButton, FixoraInput } from '../ui';
import AuthHeading from './AuthHeading';
import { loadTechDraft, saveTechDraft, validateTechStep1 } from '../../auth/fixoraAuth';

const TechOnboardingStep1 = () => {
	const { t } = useTranslation('auth');
	const router = useRouter();
	const draft = loadTechDraft();
	const [fullName, setFullName] = useState(draft?.fullName ?? '');
	const [email, setEmail] = useState(draft?.email ?? '');
	const [phone, setPhone] = useState(draft?.phone ?? '');
	const [errors, setErrors] = useState<Record<string, string>>({});

	const handleContinue = useCallback(() => {
		const result = validateTechStep1(fullName, email, phone);
		if (!result.valid) {
			setErrors(result.errors);
			return;
		}
		saveTechDraft({ fullName, email, phone });
		router.push('/register/technician/id');
	}, [fullName, email, phone, router]);

	return (
		<>
			<span className="auth-tech__step">{t('tech.step1Label')}</span>
			<AuthHeading
				titleBefore={t('tech.step1Title')}
				titleAccent=""
				subtitle={t('tech.step1Subtitle')}
			/>
			<div className="auth-tech">
				<div className="auth-tech__photo" role="button" tabIndex={0}>
					<AddAPhotoOutlined />
					<span>{t('tech.photoUpload')}</span>
				</div>
				<div className="auth-form">
					<FixoraInput
						label={t('tech.fullNameLabel')}
						type="text"
						name="fullName"
						placeholder={t('tech.fullNamePlaceholder')}
						icon={<PersonOutlined fontSize="small" />}
						value={fullName}
						onChange={(e) => setFullName(e.target.value)}
						error={!!errors.fullName}
						helperText={errors.fullName ? t(`validation.${errors.fullName}`) : undefined}
					/>
					<FixoraInput
						label={t('tech.phoneLabel')}
						type="tel"
						name="phone"
						placeholder={t('tech.phonePlaceholder')}
						icon={<PhoneOutlined fontSize="small" />}
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
						error={!!errors.phone}
						helperText={errors.phone ? t(`validation.${errors.phone}`) : undefined}
					/>
					<FixoraInput
						label={t('tech.emailLabel')}
						type="email"
						name="email"
						placeholder={t('tech.emailPlaceholder')}
						icon={<EmailOutlined fontSize="small" />}
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						error={!!errors.email}
						helperText={errors.email ? t(`validation.${errors.email}`) : undefined}
						onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
					/>
					<FixoraButton variant="primary" fullWidth onClick={handleContinue}>
						{t('tech.continue')}
						<ArrowForward fontSize="small" />
					</FixoraButton>
				</div>
			</div>
		</>
	);
};

export default TechOnboardingStep1;
