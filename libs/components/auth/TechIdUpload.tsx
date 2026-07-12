import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import CloudUploadOutlined from '@mui/icons-material/CloudUploadOutlined';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { FixoraButton } from '../ui';
import AuthHeading from './AuthHeading';
import { fixoraTechnicianSignup, isSignupConflictError, loadTechDraft, saveTechDraft } from '../../auth/fixoraAuth';
import { getTechIdFile, getTechPhotoFile, setTechIdFile } from '../../auth/techOnboardingFiles';
import { readFileAsDataUrl } from '../../utils/onboardingFileStorage';
import { sweetMixinErrorAlert } from '../../sweetAlert';

const TechIdUpload = () => {
	const { t } = useTranslation('auth');
	const router = useRouter();
	const fileRef = useRef<HTMLInputElement>(null);
	const [fileName, setFileName] = useState('');
	const [filePreview, setFilePreview] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		return () => {
			if (filePreview) URL.revokeObjectURL(filePreview);
		};
	}, [filePreview]);

	// Restore the saved draft only after mount so SSR and the first client
	// render match (sessionStorage is unavailable during SSR).
	useEffect(() => {
		const draft = loadTechDraft();
		if (!draft) return;
		setFileName(draft.idFileName ?? '');
	}, []);

	const persistFile = (file: File, idPreviewDataUrl?: string) => {
		const current = loadTechDraft();
		if (!current?.email || !current?.fullName) return;
		saveTechDraft({
			...current,
			idFileName: file.name,
			...(idPreviewDataUrl ? { idPreviewDataUrl } : {}),
		});
	};

	const handleFile = (file: File | undefined) => {
		if (!file) return;
		setFileName(file.name);
		setTechIdFile(file);
		setFilePreview((prev) => {
			if (prev) URL.revokeObjectURL(prev);
			if (file.type.startsWith('image/')) return URL.createObjectURL(file);
			return null;
		});
		void readFileAsDataUrl(file).then((idPreviewDataUrl) => persistFile(file, idPreviewDataUrl)).catch(() => persistFile(file));
	};

	const handleSubmit = useCallback(async () => {
		const currentDraft = loadTechDraft();
		if (!currentDraft?.email || !currentDraft?.fullName) {
			await router.push('/register/technician/1');
			return;
		}
		if (!fileName) return;
		const idReady = getTechIdFile() || currentDraft.idPreviewDataUrl;
		if (!idReady) {
			await sweetMixinErrorAlert(t('tech.idRequired'));
			return;
		}
		setLoading(true);
		try {
			const photoFile = getTechPhotoFile();
			let photoDataUrl = currentDraft.photoDataUrl;
			if (photoFile && !photoDataUrl) {
				try {
					photoDataUrl = await readFileAsDataUrl(photoFile);
				} catch {
					photoDataUrl = undefined;
				}
			}
			const idFile = getTechIdFile();
			let idPreviewDataUrl = currentDraft.idPreviewDataUrl;
			if (idFile && !idPreviewDataUrl) {
				try {
					idPreviewDataUrl = await readFileAsDataUrl(idFile);
				} catch {
					idPreviewDataUrl = undefined;
				}
			}
			const draft = {
				...currentDraft,
				idFileName: fileName,
				photoDataUrl,
				idPreviewDataUrl,
			};
			saveTechDraft(draft);
			await fixoraTechnicianSignup(draft);
			await router.push('/onboarding/technician');
		} catch (err: unknown) {
			if (isSignupConflictError(err)) {
				const messages = Object.values(err.conflicts)
					.map((key) => t(`validation.${key}`))
					.join(' ');
				await sweetMixinErrorAlert(messages || t('validation.signupConflict'));
				await router.push('/register/technician/1');
				return;
			}
			await sweetMixinErrorAlert(err instanceof Error ? err.message : 'Submission failed');
		} finally {
			setLoading(false);
		}
	}, [fileName, router]);

	return (
		<>
			<span className="auth-tech__step">{t('tech.step4Label')}</span>
			<AuthHeading titleBefore={t('tech.idTitle')} titleAccent="" subtitle={t('tech.idSubtitle')} />
			<div className="auth-tech">
				<input
					ref={fileRef}
					type="file"
					accept="image/*,.pdf"
					hidden
					onChange={(e) => handleFile(e.target.files?.[0])}
				/>
				<div
					className={`auth-tech__upload${filePreview ? ' auth-tech__upload--has-image' : ''}`}
					role="button"
					tabIndex={0}
					onClick={() => fileRef.current?.click()}
					onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
				>
					{filePreview ? (
						<img src={filePreview} alt="" className="auth-tech__upload-preview" />
					) : (
						<>
							<CloudUploadOutlined />
							<strong>{t('tech.idUpload')}</strong>
							<span>{fileName || t('tech.idHint')}</span>
						</>
					)}
				</div>
				{fileName && !filePreview && <p className="auth-tech__file-name">{fileName}</p>}
				<FixoraButton variant="primary" fullWidth disabled={loading || !fileName} onClick={handleSubmit}>
					{t('tech.submitVerification')}
					<ArrowForward fontSize="small" />
				</FixoraButton>
			</div>
		</>
	);
};

export default TechIdUpload;
