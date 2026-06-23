import React, { useState } from 'react';
import { UserRound } from 'lucide-react';
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
	const isUnassigned = !user && !fallbackId && !!emptyLabel;
	const name = user
		? displayUserName(user)
		: fallbackId
			? fallbackId.slice(-6)
			: emptyLabel ?? '—';
	const [imgFailed, setImgFailed] = useState(false);
	const showAvatar = Boolean(user?.userProfileImage) && !imgFailed && !isUnassigned;

	return (
		<div className="fixora-admin-device-card__person">
			<span className="fixora-admin-device-card__person-label">{label}</span>
			<div className="fixora-admin-device-card__person-body">
				<div
					className={`fixora-admin-table-user__avatar fixora-admin-table-user__avatar--sm fixora-admin-device-card__avatar${
						isUnassigned ? ' fixora-admin-device-card__avatar--empty' : ''
					}`}
				>
					{showAvatar ? (
						<img
							src={resolveProfileImageUrl(user?.userProfileImage)}
							alt=""
							onError={() => setImgFailed(true)}
						/>
					) : isUnassigned ? (
						<UserRound size={14} />
					) : (
						<span>{name.charAt(0).toUpperCase()}</span>
					)}
				</div>
				<span
					className={`fixora-admin-device-card__person-name${
						isUnassigned ? ' fixora-admin-device-card__person-name--muted' : ''
					}`}
				>
					{name}
				</span>
			</div>
		</div>
	);
};

export default AdminDevicePersonRow;
