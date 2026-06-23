import React from 'react';
import { useTranslation } from 'next-i18next';
import { Camera } from 'lucide-react';
import type { useProfileImageUpload } from '../../../hooks/useProfileImageUpload';

type AvatarUpload = ReturnType<typeof useProfileImageUpload>;

interface AdminProfileAvatarUploadProps {
	avatar: AvatarUpload;
	disabled?: boolean;
}

const AdminProfileAvatarUpload: React.FC<AdminProfileAvatarUploadProps> = ({ avatar, disabled }) => {
	const { t } = useTranslation('admin');

	return (
		<div className="fixora-admin-profile-avatar">
			<button
				type="button"
				className={`fixora-admin-profile-avatar__trigger${avatar.dragging ? ' fixora-admin-profile-avatar__trigger--dragging' : ''}`}
				onClick={() => !disabled && avatar.openPicker()}
				onDragOver={(e) => {
					e.preventDefault();
					if (!disabled) avatar.setDragging(true);
				}}
				onDragLeave={() => avatar.setDragging(false)}
				onDrop={(e) => {
					if (!disabled) avatar.onDrop(e);
				}}
				disabled={disabled}
				aria-label={t('settings.profile.changePhoto')}
			>
				{avatar.previewUrl ? (
					<img src={avatar.previewUrl} alt="" className="fixora-admin-profile-avatar__image" />
				) : (
					<span className="fixora-admin-profile-avatar__placeholder">
						<Camera size={22} />
					</span>
				)}
				<span className="fixora-admin-profile-avatar__badge">
					<Camera size={12} />
				</span>
			</button>
			<div className="fixora-admin-profile-avatar__meta">
				<p className="fixora-admin-profile-avatar__title">{t('settings.profile.photoTitle')}</p>
				<p className="fixora-admin-profile-avatar__hint">{t('settings.profile.photoHint')}</p>
			</div>
			<input
				ref={avatar.fileRef}
				type="file"
				accept="image/png,image/jpeg,image/jpg,image/webp"
				className="fixora-admin-profile-avatar__input"
				onChange={avatar.pickFile}
				disabled={disabled}
			/>
		</div>
	);
};

export default AdminProfileAvatarUpload;
