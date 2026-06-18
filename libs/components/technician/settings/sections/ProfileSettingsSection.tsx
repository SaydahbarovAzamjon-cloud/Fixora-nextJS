import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import CameraAltOutlined from '@mui/icons-material/CameraAltOutlined';
import SettingsSectionHead from '../SettingsSectionHead';
import SettingsField from '../SettingsField';
import SettingsSaveButton from '../SettingsSaveButton';
import { ProfileFormState, TechnicianSettingsUser } from '../../../../hooks/useTechnicianSettings';
import { useProfileImageUpload } from '../../../../hooks/useProfileImageUpload';
import { sweetMixinErrorAlert } from '../../../../sweetAlert';

interface ProfileSettingsSectionProps {
	user: TechnicianSettingsUser | null;
	form: ProfileFormState;
	onChange: (partial: Partial<ProfileFormState>) => void;
	onSave: (profileImagePath?: string) => Promise<boolean>;
	saving: boolean;
}

const ProfileSettingsSection: React.FC<ProfileSettingsSectionProps> = ({
	user,
	form,
	onChange,
	onSave,
	saving,
}) => {
	const { t } = useTranslation('technician');

	const onUploadError = (key: string) => {
		if (key === 'invalidType') sweetMixinErrorAlert(t('settings.profile.invalidType')).then();
		else if (key === 'tooLarge') sweetMixinErrorAlert(t('settings.profile.tooLarge')).then();
	};

	const avatar = useProfileImageUpload(onUploadError);

	React.useEffect(() => {
		if (user?.userProfileImage) {
			avatar.setExistingImage(user.userProfileImage);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate avatar once per profile image path
	}, [user?.userProfileImage]);

	const initials = useMemo(() => {
		const name = form.fullName || user?.userFullName || '';
		return name
			.split(' ')
			.map((p) => p.charAt(0))
			.slice(0, 2)
			.join('')
			.toUpperCase() || 'T';
	}, [form.fullName, user?.userFullName]);

	const profileUrl = user?.userNickname ? `${user.userNickname}.fixora.io` : '';

	const handleSave = async () => {
		let imagePath: string | undefined;
		try {
			if (avatar.cover?.file) {
				imagePath = await avatar.uploadProfileImage();
				if (!imagePath) {
					await sweetMixinErrorAlert(t('settings.profile.uploadFailed'));
					return;
				}
			} else if (!avatar.hasImage && user?.userProfileImage) {
				imagePath = '';
			}
			const ok = await onSave(imagePath);
			if (ok) {
				avatar.clearDraftAfterSave(imagePath === '' ? null : imagePath ?? user?.userProfileImage);
			}
		} catch {
			await sweetMixinErrorAlert(t('settings.profile.uploadFailed'));
		}
	};

	return (
		<div className="fts-section">
			<SettingsSectionHead title={t('settings.profile.title')} desc={t('settings.profile.desc')} />

			<div
				className={`fts-avatar-block ${avatar.dragging ? 'fts-avatar-block--dragging' : ''}`}
				onDragOver={(e) => {
					e.preventDefault();
					avatar.setDragging(true);
				}}
				onDragLeave={() => avatar.setDragging(false)}
				onDrop={avatar.onDrop}
			>
				<div className="fts-avatar-block__visual">
					{avatar.previewUrl ? (
						<img src={avatar.previewUrl} alt="" className="fts-avatar-block__img" />
					) : (
						<div className="fts-avatar-block__initials">{initials}</div>
					)}
					<button type="button" className="fts-avatar-block__camera" onClick={avatar.openPicker}>
						<CameraAltOutlined style={{ fontSize: 11 }} />
					</button>
					<input ref={avatar.fileRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" hidden onChange={avatar.pickFile} />
				</div>
				<div className="fts-avatar-block__meta">
					<div className="fts-avatar-block__title">{t('settings.profile.photoTitle')}</div>
					<div className="fts-avatar-block__hint">{t('settings.profile.photoHint')}</div>
					{avatar.fileName && <div className="fts-avatar-block__filename">{avatar.fileName}</div>}
					<div className="fts-avatar-block__actions">
						<button type="button" className="fts-avatar-block__upload" onClick={avatar.openPicker}>
							{t('settings.profile.uploadPhoto')}
						</button>
						{avatar.hasImage && (
							<>
								<button type="button" className="fts-avatar-block__link" onClick={avatar.openPicker}>
									{t('settings.profile.replacePhoto')}
								</button>
								<button type="button" className="fts-avatar-block__link fts-avatar-block__link--danger" onClick={avatar.clearCover}>
									{t('settings.profile.removePhoto')}
								</button>
							</>
						)}
					</div>
				</div>
			</div>

			<div className="fts-grid fts-grid--2">
				<SettingsField label={t('settings.profile.fullName')}>
					<input
						className="fts-input"
						value={form.fullName}
						onChange={(e) => onChange({ fullName: e.target.value })}
					/>
				</SettingsField>
				<SettingsField label={t('settings.profile.location')}>
					<input
						className="fts-input"
						value={form.location}
						onChange={(e) => onChange({ location: e.target.value })}
					/>
				</SettingsField>
				<SettingsField label={t('settings.profile.email')}>
					<input className="fts-input fts-input--readonly" value={user?.userEmail ?? ''} readOnly />
				</SettingsField>
				<SettingsField label={t('settings.profile.phone')}>
					<input
						className="fts-input"
						value={form.phone}
						onChange={(e) => onChange({ phone: e.target.value })}
					/>
				</SettingsField>
				<SettingsField label={t('settings.profile.profileUrl')} className="fts-grid__full">
					<input className="fts-input fts-input--readonly" value={profileUrl} readOnly />
				</SettingsField>
			</div>

			<SettingsField label={t('settings.profile.bio')}>
				<textarea
					className="fts-textarea"
					rows={4}
					value={form.bio}
					onChange={(e) => onChange({ bio: e.target.value })}
				/>
			</SettingsField>

			<SettingsSaveButton onClick={handleSave} loading={saving || avatar.uploading} label={t('settings.saveChanges')} />
		</div>
	);
};

export default ProfileSettingsSection;
