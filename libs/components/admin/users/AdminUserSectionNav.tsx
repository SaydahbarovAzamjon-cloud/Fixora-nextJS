import React from 'react';
import { useTranslation } from 'next-i18next';

export const ADMIN_USER_SECTIONS = [
	'overview',
	'performance',
	'financial',
	'content',
	'verification',
	'moderation',
	'activity',
] as const;

export type AdminUserSectionId = (typeof ADMIN_USER_SECTIONS)[number];

interface AdminUserSectionNavProps {
	active: AdminUserSectionId;
	onSelect: (id: AdminUserSectionId) => void;
}

const AdminUserSectionNav: React.FC<AdminUserSectionNavProps> = ({ active, onSelect }) => {
	const { t } = useTranslation('admin');

	return (
		<nav className="fixora-admin-user-section-nav" aria-label={t('userDetail.sectionsNav')}>
			{ADMIN_USER_SECTIONS.map((id) => (
				<button
					key={id}
					type="button"
					className={`fixora-admin-user-section-nav__item${active === id ? ' fixora-admin-user-section-nav__item--active' : ''}`}
					onClick={() => onSelect(id)}
				>
					{t(`userDetail.sections.${id}`)}
				</button>
			))}
		</nav>
	);
};

export default AdminUserSectionNav;
