import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { ChevronDown, LogOut, Settings } from 'lucide-react';
import { userVar } from '../../../apollo/store';
import { logOut } from '../../auth';
import { displayUserName } from '../../hooks/useUserLookup';
import AdminAvatar from './AdminAvatar';

export interface AdminUserMenuButtonProps {
	variant?: 'full' | 'avatar';
	className?: string;
}

const AdminUserMenuButton: React.FC<AdminUserMenuButtonProps> = ({ variant = 'full', className = '' }) => {
	const { t } = useTranslation('admin');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [menuOpen, setMenuOpen] = useState(false);
	const userMenuRef = useRef<HTMLDivElement>(null);

	const displayName = displayUserName(user as Parameters<typeof displayUserName>[0]) || t('nav.admin');
	const profileImage = user?.memberImage || (user as { userProfileImage?: string | null })?.userProfileImage;

	useEffect(() => {
		const onDocClick = (e: MouseEvent) => {
			if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
				setMenuOpen(false);
			}
		};
		document.addEventListener('mousedown', onDocClick);
		return () => document.removeEventListener('mousedown', onDocClick);
	}, []);

	const handleLogout = () => {
		setMenuOpen(false);
		logOut();
		router.push('/login').then();
	};

	return (
		<div className={`fixora-admin-header__user-wrap${className ? ` ${className}` : ''}`} ref={userMenuRef}>
			<button
				type="button"
				className={`fixora-admin-header__user${variant === 'avatar' ? ' fixora-admin-header__user--avatar-only' : ''}`}
				onClick={() => setMenuOpen((v) => !v)}
				aria-expanded={menuOpen}
				aria-label={displayName}
			>
				<AdminAvatar image={profileImage} name={displayName} size="sm" className="fixora-admin-header__avatar" />
				{variant === 'full' && (
					<>
						<span className="fixora-admin-header__name">{displayName}</span>
						<ChevronDown size={14} />
					</>
				)}
			</button>
			{menuOpen && (
				<div className="fixora-admin-header__user-menu" role="menu">
					<button
						type="button"
						className="fixora-admin-header__user-menu-item"
						role="menuitem"
						onClick={() => {
							setMenuOpen(false);
							router.push('/_admin/settings');
						}}
					>
						<Settings size={16} />
						{t('header.settings')}
					</button>
					<button
						type="button"
						className="fixora-admin-header__user-menu-item fixora-admin-header__user-menu-item--danger"
						role="menuitem"
						onClick={handleLogout}
					>
						<LogOut size={16} />
						{t('header.logout')}
					</button>
				</div>
			)}
		</div>
	);
};

export default AdminUserMenuButton;
