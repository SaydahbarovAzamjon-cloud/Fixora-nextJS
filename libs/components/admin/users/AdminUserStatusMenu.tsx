import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useMutation } from '@apollo/client';
import { ChevronDown } from 'lucide-react';
import { UPDATE_USER_BY_ADMIN } from '../../../../apollo/admin/mutation';
import type { AdminUser, AdminUserStatus } from '../../../types/admin/admin';
import { userStatusTone } from '../../../utils/adminBadges';
import AdminStatusBadge from '../shared/AdminStatusBadge';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../../sweetAlert';

const STATUSES: AdminUserStatus[] = ['ACTIVE', 'BLOCK', 'DELETE'];

interface AdminUserStatusMenuProps {
	user: AdminUser;
	onUpdated?: () => void;
}

const AdminUserStatusMenu: React.FC<AdminUserStatusMenuProps> = ({ user, onUpdated }) => {
	const { t } = useTranslation('admin');
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const [updateUser, { loading }] = useMutation(UPDATE_USER_BY_ADMIN);

	useEffect(() => {
		if (!open) return;
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, [open]);

	const applyStatus = async (next: AdminUserStatus) => {
		if (next === user.userStatus) {
			setOpen(false);
			return;
		}
		if (next === 'BLOCK' && !window.confirm(t('users.statusMenu.confirmBlock'))) return;
		if (next === 'DELETE' && !window.confirm(t('users.statusMenu.confirmDelete'))) return;

		try {
			await updateUser({ variables: { input: { _id: user._id, userStatus: next } } });
			await sweetTopSmallSuccessAlert(t('users.statusMenu.updated'), 1200);
			setOpen(false);
			onUpdated?.();
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	return (
		<div className="fixora-admin-status-menu" ref={ref}>
			<button
				type="button"
				className="fixora-admin-status-menu__trigger"
				onClick={() => setOpen((v) => !v)}
				aria-expanded={open}
				aria-label={t('users.statusMenu.label')}
				disabled={loading}
			>
				<AdminStatusBadge
					label={t(`users.statuses.${user.userStatus}`)}
					tone={userStatusTone(user.userStatus)}
				/>
				<ChevronDown size={12} className="fixora-admin-status-menu__chevron" />
			</button>
			{open && (
				<div className="fixora-admin-status-menu__dropdown" role="menu">
					{STATUSES.map((status) => (
						<button
							key={status}
							type="button"
							role="menuitem"
							className={`fixora-admin-status-menu__item${status === user.userStatus ? ' fixora-admin-status-menu__item--active' : ''}`}
							onClick={() => applyStatus(status)}
						>
							{t(`users.statuses.${status}`)}
						</button>
					))}
				</div>
			)}
		</div>
	);
};

export default AdminUserStatusMenu;
