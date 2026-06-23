import React, { useCallback, useEffect, useRef, useState } from 'react';
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
	const fileRef = useRef<HTMLInputElement>(null);
	const [fullName, setFullName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [photoFileName, setPhotoFileName] = useState('');
	const [photoPreview, setPhotoPreview] = useState<string | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		return () => {
			if (photoPreview) URL.revokeObjectURL(photoPreview);
		};
	}, [photoPreview]);

	// Restore the saved draft only after mount so SSR and the first client
	// render match (sessionStorage is unavailable during SSR).
	useEffect(() => {
		const draft = loadTechDraft();
		if (!draft) return;
		setFullName(draft.fullName ?? '');
		setEmail(draft.email ?? '');
		setPhone(draft.phone ?? '');
		setPhotoFileName(draft.photoFileName ?? '');
	}, []);

	const handlePhoto = (file: File | undefined) => {
		if (!file) return;
		if (!file.type.startsWith('image/')) return;
		setPhotoFileName(file.name);
		setPhotoPreview((prev) => {
			if (prev) URL.revokeObjectURL(prev);
			return URL.createObjectURL(file);
		});
		const current = loadTechDraft();
		saveTechDraft({
			fullName: current?.fullName ?? fullName,
			email: current?.email ?? email,
			phone: current?.phone ?? phone,
			photoFileName: file.name,
			idFileName: current?.idFileName,
		});
	};

	const handleContinue = useCallback(() => {
		const result = validateTechStep1(fullName, email, phone);
		if (!result.valid) {
			setErrors(result.errors);
			return;
		}
		const current = loadTechDraft();
		saveTechDraft({
			fullName,
			email,
			phone,
			photoFileName: photoFileName || current?.photoFileName,
			idFileName: current?.idFileName,
		});
		router.push('/register/technician/id');
	}, [fullName, email, phone, photoFileName, router]);

	return (
		<>
			<span className="auth-tech__step">{t('tech.step1Label')}</span>
			<AuthHeading
				titleBefore={t('tech.step1Title')}
				titleAccent=""
				subtitle={t('tech.step1Subtitle')}
			/>
			<div className="auth-tech">
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
							<span>{photoFileName || t('tech.photoUpload')}</span>
						</>
					)}
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
