import React from 'react';
import { useTranslation } from 'next-i18next';
import AdminStatusBadge from '../shared/AdminStatusBadge';
import { getAdminUserBadges } from '../../../utils/adminUserBadges';
import type { AdminUser } from '../../../types/admin/admin';

interface AdminUserBadgeStackProps {
	user: Pick<AdminUser, 'badgeLevel' | 'isVerified' | 'userStatus' | 'isBlocked'>;
	className?: string;
	compact?: boolean;
}

const AdminUserBadgeStack: React.FC<AdminUserBadgeStackProps> = ({ user, className = '', compact = false }) => {
	const { t } = useTranslation('admin');
	const badges = getAdminUserBadges(user);

	if (badges.length === 0) {
		return compact ? null : <span className="fixora-admin-muted">—</span>;
	}

	return (
		<div className={`fixora-admin-user-badges${compact ? ' fixora-admin-user-badges--compact' : ''} ${className}`.trim()}>
			{badges.map((badge) => (
				<AdminStatusBadge key={badge.kind} label={t(badge.labelKey)} tone={badge.tone} />
			))}
		</div>
	);
};

export default AdminUserBadgeStack;
