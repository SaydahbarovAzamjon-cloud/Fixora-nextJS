import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import CloudUploadOutlined from '@mui/icons-material/CloudUploadOutlined';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { FixoraButton } from '../ui';
import AuthHeading from './AuthHeading';
import { fixoraTechnicianSignup, loadTechDraft, saveTechDraft } from '../../auth/fixoraAuth';
import { sweetMixinErrorAlert } from '../../sweetAlert';

const TechIdUpload = () => {
	const { t } = useTranslation('auth');
	const router = useRouter();
	const fileRef = useRef<HTMLInputElement>(null);
	const draft = loadTechDraft();
	const [fileName, setFileName] = useState(draft?.idFileName ?? '');
	const [previewUrl, setPreviewUrl] = useState(draft?.idPreviewDataUrl ?? '');
	const [isImage, setIsImage] = useState(!!draft?.idPreviewDataUrl);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		return () => {
			if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
		};
	}, [previewUrl]);

	const persistFile = (file: File, dataUrl?: string) => {
		const current = loadTechDraft();
		if (!current?.email || !current?.fullName) return;
		saveTechDraft({
			...current,
			idFileName: file.name,
			idPreviewDataUrl: dataUrl,
		});
	};

	const handleFile = (file: File | undefined) => {
		if (!file) return;
		setFileName(file.name);

		if (file.type.startsWith('image/')) {
			const reader = new FileReader();
			reader.onload = () => {
				const dataUrl = typeof reader.result === 'string' ? reader.result : '';
				setPreviewUrl(dataUrl);
				setIsImage(true);
				persistFile(file, dataUrl);
			};
			reader.readAsDataURL(file);
			return;
		}

		setPreviewUrl('');
		setIsImage(false);
		persistFile(file);
	};

	const handleSubmit = useCallback(async () => {
		const currentDraft = loadTechDraft();
		if (!currentDraft?.email || !currentDraft?.fullName) {
			await router.push('/register/technician/1');
			return;
		}
		setLoading(true);
		try {
			await fixoraTechnicianSignup({ ...currentDraft, idFileName: fileName });
			await router.push('/register/technician/pending');
		} catch (err: any) {
			await sweetMixinErrorAlert(err?.message ?? 'Submission failed');
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
					className={`auth-tech__upload ${previewUrl ? 'auth-tech__upload--has-image' : ''}`}
					role="button"
					tabIndex={0}
					onClick={() => fileRef.current?.click()}
					onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
				>
					{previewUrl && isImage ? (
						<img src={previewUrl} alt="" className="auth-tech__upload-preview" />
					) : (
						<>
							<CloudUploadOutlined />
							<strong>{t('tech.idUpload')}</strong>
							<span>{fileName || t('tech.idHint')}</span>
						</>
					)}
				</div>
				{fileName && !isImage && (
					<p className="auth-tech__file-name">{fileName}</p>
				)}
				<FixoraButton variant="primary" fullWidth disabled={loading || !fileName} onClick={handleSubmit}>
					{t('tech.submitVerification')}
					<ArrowForward fontSize="small" />
				</FixoraButton>
			</div>
		</>
	);
};

export default TechIdUpload;
