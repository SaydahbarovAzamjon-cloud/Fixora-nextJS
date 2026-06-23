import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMutation } from '@apollo/client';
import {
	MoreHorizontal,
	Eye,
	ClipboardList,
	CreditCard,
	AlertTriangle,
	Ban,
	CheckCircle,
	Key,
	Trash2,
	Star,
	ShieldCheck,
	ShieldOff,
	Crown,
} from 'lucide-react';
import { UPDATE_USER_BY_ADMIN, APPROVE_TECHNICIAN } from '../../../../apollo/admin/mutation';
import type { AdminUser } from '../../../types/admin/admin';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../../sweetAlert';
import AdminUserActionModals, { type AdminUserModalAction } from './modals/AdminUserActionModals';

export type AdminUserActionId =
	| 'viewProfile'
	| 'viewBookings'
	| 'viewPayments'
	| 'viewReviews'
	| 'verifyTechnician'
	| 'removeVerification'
	| 'grantPremium'
	| 'removePremium'
	| 'sendWarning'
	| 'suspend'
	| 'activate'
	| 'resetPassword'
	| 'deleteAccount';

interface AdminUserActionsMenuProps {
	user: AdminUser;
	onUpdated?: () => void;
	compact?: boolean;
}

const AdminUserActionsMenu: React.FC<AdminUserActionsMenuProps> = ({ user, onUpdated, compact }) => {
	const { t } = useTranslation('admin');
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [modalAction, setModalAction] = useState<AdminUserModalAction | null>(null);
	const ref = useRef<HTMLDivElement>(null);

	const [updateUser] = useMutation(UPDATE_USER_BY_ADMIN);
	const [approveTechnician] = useMutation(APPROVE_TECHNICIAN);

	const isTechnician = user.userType === 'TECHNICIAN';
	const isSuspended = user.userStatus === 'BLOCK';
	const isDeleted = user.userStatus === 'DELETE';
	const canVerify =
		isTechnician &&
		(user.verificationStatus === 'UNDER_REVIEW' || user.verificationStatus === 'PENDING');
	const isPremium = user.badgeLevel === 'PREMIUM_PRO';
	const isVerified = user.badgeLevel === 'VERIFIED' || user.isVerified;

	useEffect(() => {
		if (!open) return;
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, [open]);

	const runUpdate = async (input: { _id: string; userStatus?: string; userPassword?: string }) => {
		try {
			await updateUser({ variables: { input } });
			await sweetTopSmallSuccessAlert(t('common.success'), 1200);
			setOpen(false);
			onUpdated?.();
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const handleAction = async (actionId: AdminUserActionId) => {
		setOpen(false);
		switch (actionId) {
			case 'viewProfile':
				router.push(`/_admin/users/${user._id}`);
				break;
			case 'viewBookings':
				router.push(`/_admin/bookings?userId=${user._id}`);
				break;
			case 'viewPayments':
				router.push(`/_admin/payments?userId=${user._id}`);
				break;
			case 'viewReviews':
				router.push(`/_admin/users/${user._id}#performance`);
				break;
			case 'verifyTechnician':
				if (!canVerify) {
					router.push(`/_admin/verification`);
					return;
				}
				try {
					await approveTechnician({ variables: { userId: user._id } });
					await sweetTopSmallSuccessAlert(t('common.success'), 1200);
					onUpdated?.();
				} catch (err) {
					await sweetErrorHandling(err);
				}
				break;
			case 'removeVerification':
			case 'grantPremium':
			case 'removePremium':
			case 'sendWarning':
				setModalAction(actionId);
				break;
			case 'suspend':
				setModalAction('suspend');
				break;
			case 'activate':
				await runUpdate({ _id: user._id, userStatus: 'ACTIVE' });
				break;
			case 'resetPassword':
				setModalAction('resetPassword');
				break;
			case 'deleteAccount':
				setModalAction('deleteAccount');
				break;
			default:
				break;
		}
	};

	type MenuItem = { id: AdminUserActionId; icon: React.ReactNode; label: string; disabled?: boolean; danger?: boolean };

	const commonItems: MenuItem[] = [
		{ id: 'viewProfile', icon: <Eye size={15} />, label: t('userDetail.actions.viewProfile') },
		{ id: 'viewBookings', icon: <ClipboardList size={15} />, label: t('userDetail.actions.viewBookings') },
		{ id: 'viewPayments', icon: <CreditCard size={15} />, label: t('userDetail.actions.viewPayments') },
		{ id: 'sendWarning', icon: <AlertTriangle size={15} />, label: t('userDetail.actions.sendWarning') },
		{
			id: 'suspend',
			icon: <Ban size={15} />,
			label: t('userDetail.actions.suspend'),
			disabled: isSuspended || isDeleted,
			danger: true,
		},
		{
			id: 'activate',
			icon: <CheckCircle size={15} />,
			label: t('userDetail.actions.activate'),
			disabled: !isSuspended && !isDeleted,
		},
		{ id: 'resetPassword', icon: <Key size={15} />, label: t('userDetail.actions.resetPassword') },
		{
			id: 'deleteAccount',
			icon: <Trash2 size={15} />,
			label: t('userDetail.actions.deleteAccount'),
			disabled: isDeleted,
			danger: true,
		},
	];

	const techItems: MenuItem[] = [
		{ id: 'viewReviews', icon: <Star size={15} />, label: t('userDetail.actions.viewReviews') },
		{
			id: 'verifyTechnician',
			icon: <ShieldCheck size={15} />,
			label: t('userDetail.actions.verifyTechnician'),
			disabled: user.verificationStatus === 'APPROVED',
		},
		{
			id: 'removeVerification',
			icon: <ShieldOff size={15} />,
			label: t('userDetail.actions.removeVerification'),
			disabled: !isVerified,
		},
		{
			id: 'grantPremium',
			icon: <Crown size={15} />,
			label: t('userDetail.actions.grantPremium'),
			disabled: isPremium,
		},
		{
			id: 'removePremium',
			icon: <Crown size={15} />,
			label: t('userDetail.actions.removePremium'),
			disabled: !isPremium,
		},
	];

	const menuItems = isTechnician
		? [
				commonItems[0],
				commonItems[1],
				commonItems[2],
				...techItems.slice(0, 1),
				...techItems.slice(1),
				...commonItems.slice(3),
			]
		: commonItems;

	return (
		<>
			<div className={`fixora-admin-actions-menu${compact ? ' fixora-admin-actions-menu--compact' : ''}`} ref={ref}>
				<button
					type="button"
					className="fixora-admin-actions-menu__trigger"
					onClick={() => setOpen((v) => !v)}
					aria-expanded={open}
					aria-label={t('userDetail.actions.menu')}
				>
					<MoreHorizontal size={16} />
				</button>
				{open && (
					<div className="fixora-admin-actions-menu__dropdown" role="menu">
						{menuItems.map((item) => (
							<button
								key={item.id}
								type="button"
								role="menuitem"
								className={`fixora-admin-actions-menu__item${item.danger ? ' fixora-admin-actions-menu__item--danger' : ''}`}
								disabled={item.disabled}
								onClick={() => handleAction(item.id)}
							>
								{item.icon}
								<span>{item.label}</span>
							</button>
						))}
					</div>
				)}
			</div>

			<AdminUserActionModals
				action={modalAction}
				user={user}
				onClose={() => setModalAction(null)}
				onUpdated={() => {
					setModalAction(null);
					onUpdated?.();
				}}
			/>
		</>
	);
};

export default AdminUserActionsMenu;
