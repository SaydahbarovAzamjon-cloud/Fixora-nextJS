import React from 'react';
import { resolveProfileImageUrl } from '../../utils/profileImage';

interface AdminAvatarProps {
	image?: string | null;
	name: string;
	size?: 'sm' | 'md' | 'lg';
	className?: string;
}

const SIZE_CLASS = {
	sm: 'fixora-admin-avatar--sm',
	md: 'fixora-admin-avatar--md',
	lg: 'fixora-admin-avatar--lg',
} as const;

const AdminAvatar: React.FC<AdminAvatarProps> = ({ image, name, size = 'md', className = '' }) => {
	const src = resolveProfileImageUrl(image);
	const initials = name.charAt(0).toUpperCase();
	const isDefault = !image || src.includes('defaultUser');

	return (
		<div className={`fixora-admin-avatar ${SIZE_CLASS[size]} ${className}`.trim()}>
			{!isDefault ? (
				<img src={src} alt="" className="fixora-admin-avatar__img" />
			) : (
				<span className="fixora-admin-avatar__initials">{initials}</span>
			)}
		</div>
	);
};

export default AdminAvatar;
