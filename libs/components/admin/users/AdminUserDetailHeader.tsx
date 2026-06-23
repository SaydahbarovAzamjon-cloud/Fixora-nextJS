import React from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { ExternalLink } from 'lucide-react';
import AdminAvatar from '../AdminAvatar';
import AdminUserBadgeStack from './AdminUserBadgeStack';
import AdminStatusBadge from '../shared/AdminStatusBadge';
import AdminUserActionsMenu from './AdminUserActionsMenu';
import { displayUserName } from '../../../hooks/useUserLookup';
import { userRoleTone, userStatusTone } from '../../../utils/adminBadges';
import type { AdminUser } from '../../../types/admin/admin';

interface AdminUserDetailHeaderProps {
	user: AdminUser;
	onUpdated?: () => void;
}

const AdminUserDetailHeader: React.FC<AdminUserDetailHeaderProps> = ({ user, onUpdated }) => {
	const { t } = useTranslation('admin');
	const router = useRouter();
	const name = displayUserName(user);

	return (
		<div className="fixora-admin-user-detail-header">
			<div className="fixora-admin-user-detail-header__main">
				<AdminAvatar image={user.userProfileImage} name={name} size="lg" />
				<div className="fixora-admin-user-detail-header__info">
					<h2 className="fixora-admin-user-detail-header__name">{name}</h2>
					{user.userNickname && (
						<p className="fixora-admin-user-detail-header__nickname">@{user.userNickname}</p>
					)}
					<div className="fixora-admin-user-detail-header__meta">
						<AdminStatusBadge label={t(`users.roles.${user.userType}`)} tone={userRoleTone(user.userType)} />
						<AdminStatusBadge
							label={t(`users.statuses.${user.userStatus}`)}
							tone={userStatusTone(user.userStatus)}
						/>
						<AdminUserBadgeStack user={user} compact />
					</div>
				</div>
			</div>
			<div className="fixora-admin-user-detail-header__actions">
				{user.userType === 'TECHNICIAN' && (
					<button
						type="button"
						className="fixora-admin-btn fixora-admin-btn--ghost"
						onClick={() => router.push(`/technicians/${user._id}`)}
					>
						<ExternalLink size={14} />
						{t('userDetail.viewPublicProfile')}
					</button>
				)}
				<AdminUserActionsMenu user={user} onUpdated={onUpdated} />
			</div>
		</div>
	);
};

export default AdminUserDetailHeader;
