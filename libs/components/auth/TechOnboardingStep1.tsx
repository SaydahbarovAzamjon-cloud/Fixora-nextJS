import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import PersonOutlined from '@mui/icons-material/PersonOutlined';
import PhoneOutlined from '@mui/icons-material/PhoneOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import AddAPhotoOutlined from '@mui/icons-material/AddAPhotoOutlined';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { FixoraButton, FixoraInput } from '../ui';
import AuthHeading from './AuthHeading';
import AuthDivider from './AuthDivider';
import SocialAuthRow from './SocialAuthRow';
import { loadTechDraft, saveTechDraft, validateTechStep1, isSignupConflictError } from '../../auth/fixoraAuth';
import { assertSignupFieldsAvailable, deriveSignupNickname } from '../../auth/signupAvailability';
import { initializeApollo } from '../../../apollo/client';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { getGraphQLErrorMessage } from '../../utils/oauthErrors';
import { setTechPhotoFile, getTechPhotoFile } from '../../auth/techOnboardingFiles';
import { readFileAsDataUrl } from '../../utils/onboardingFileStorage';

const TechOnboardingStep1 = () => {
	const { t } = useTranslation('auth');
	const router = useRouter();
	const fileRef = useRef<HTMLInputElement>(null);
	const [fullName, setFullName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [photoFileName, setPhotoFileName] = useState('');
	const [photoPreview, setPhotoPreview] = useState<string | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [checking, setChecking] = useState(false);

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
		setPassword(draft.password ?? '');
		setConfirmPassword(draft.password ?? '');
		setPhotoFileName(draft.photoFileName ?? '');
	}, []);

	const handlePhoto = (file: File | undefined) => {
		if (!file) return;
		if (!file.type.startsWith('image/')) return;
		setTechPhotoFile(file);
		setPhotoFileName(file.name);
		setPhotoPreview((prev) => {
			if (prev) URL.revokeObjectURL(prev);
			return URL.createObjectURL(file);
		});
		const current = loadTechDraft();
		void readFileAsDataUrl(file).then((photoDataUrl) => {
			saveTechDraft({
				fullName: current?.fullName ?? fullName,
				email: current?.email ?? email,
				phone: current?.phone ?? phone,
				photoFileName: file.name,
				photoDataUrl,
				idFileName: current?.idFileName,
				idPreviewDataUrl: current?.idPreviewDataUrl,
			});
		});
	};

	const handleContinue = useCallback(async () => {
		const result = validateTechStep1(fullName, email, phone, password, confirmPassword);
		if (!result.valid) {
			setErrors(result.errors);
			return;
		}
		setErrors({});
		setChecking(true);
		try {
			const apolloClient = await initializeApollo();
			await assertSignupFieldsAvailable(apolloClient, {
				email,
				nickname: deriveSignupNickname(fullName, email),
				fullName,
				...(phone.trim() ? { phone } : {}),
			});
		} catch (err) {
			if (isSignupConflictError(err)) {
				const conflicts = { ...err.conflicts };
				if (conflicts.nickname) {
					conflicts.fullName = conflicts.nickname;
					delete conflicts.nickname;
				}
				setErrors(conflicts);
				return;
			}
			await sweetMixinErrorAlert(getGraphQLErrorMessage(err) || t('validation.signupConflict'));
			return;
		} finally {
			setChecking(false);
		}

		const current = loadTechDraft();
		const photoFile = getTechPhotoFile();
		let photoDataUrl = current?.photoDataUrl;
		if (photoFile && !photoDataUrl) {
			try {
				photoDataUrl = await readFileAsDataUrl(photoFile);
			} catch {
				photoDataUrl = undefined;
			}
		}
		saveTechDraft({
			fullName,
			email,
			phone,
			password,
			photoFileName: photoFileName || current?.photoFileName,
			photoDataUrl,
			idFileName: current?.idFileName,
			idPreviewDataUrl: current?.idPreviewDataUrl,
		});
		await router.push('/register/technician/id');
	}, [fullName, email, phone, password, confirmPassword, photoFileName, router, t]);

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
						helperText={errors.password ? t(`validation.${errors.password}`) : t('register.passwordHint')}
					/>
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
						onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
					/>
					<FixoraButton variant="primary" fullWidth disabled={checking} onClick={handleContinue}>
						{t('tech.continue')}
						<ArrowForward fontSize="small" />
					</FixoraButton>
				</div>
			</div>
			<AuthDivider />
			<SocialAuthRow mode="register" />
		</>
	);
};

export default TechOnboardingStep1;
