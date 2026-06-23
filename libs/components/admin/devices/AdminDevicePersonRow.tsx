import React from 'react';
import { displayUserName } from '../../../hooks/useUserLookup';
import type { AdminUser } from '../../../types/admin/admin';
import { resolveProfileImageUrl } from '../../../utils/profileImage';

interface AdminDevicePersonRowProps {
	label: string;
	user?: AdminUser | null;
	fallbackId?: string;
	emptyLabel?: string;
}

const AdminDevicePersonRow: React.FC<AdminDevicePersonRowProps> = ({ label, user, fallbackId, emptyLabel }) => {
	const name = user
		? displayUserName(user)
		: fallbackId
			? fallbackId.slice(-6)
			: emptyLabel ?? '—';

	return (
		<div className="fixora-admin-device-card__person">
			<span className="fixora-admin-device-card__person-label">{label}</span>
			<div className="fixora-admin-device-card__person-body">
				<div className="fixora-admin-table-user__avatar fixora-admin-table-user__avatar--sm">
					<img src={resolveProfileImageUrl(user?.userProfileImage)} alt="" />
				</div>
				<span className={`fixora-admin-device-card__person-name${!user && !fallbackId ? ' fixora-admin-device-card__person-name--muted' : ''}`}>
					{name}
				</span>
			</div>
		</div>
	);
};

export default AdminDevicePersonRow;
