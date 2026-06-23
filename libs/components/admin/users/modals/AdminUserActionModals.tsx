import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useMutation } from '@apollo/client';
import {
	UPDATE_USER_BY_ADMIN,
	ADMIN_RESET_PASSWORD,
	SET_TECHNICIAN_BADGE_LEVEL,
	REVOKE_TECHNICIAN_VERIFICATION,
	WARN_USER,
} from '../../../../../apollo/admin/mutation';
import type { AdminUser } from '../../../../types/admin/admin';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../../../sweetAlert';

export type AdminUserModalAction =
	| 'suspend'
	| 'deleteAccount'
	| 'resetPassword'
	| 'sendWarning'
	| 'removeVerification'
	| 'grantPremium'
	| 'removePremium';

interface AdminUserActionModalsProps {
	action: AdminUserModalAction | null;
	user: AdminUser;
	onClose: () => void;
	onUpdated: () => void;
}

const AdminUserActionModals: React.FC<AdminUserActionModalsProps> = ({ action, user, onClose, onUpdated }) => {
	const { t } = useTranslation('admin');
	const [newPassword, setNewPassword] = useState('');
	const [warningReason, setWarningReason] = useState('');
	const [revokeReason, setRevokeReason] = useState('');

	const [updateUser, { loading: updating }] = useMutation(UPDATE_USER_BY_ADMIN);
	const [adminResetPassword, { loading: resetting }] = useMutation(ADMIN_RESET_PASSWORD);
	const [setBadgeLevel, { loading: badgeLoading }] = useMutation(SET_TECHNICIAN_BADGE_LEVEL);
	const [revokeVerification, { loading: revoking }] = useMutation(REVOKE_TECHNICIAN_VERIFICATION);
	const [warnUser, { loading: warning }] = useMutation(WARN_USER);

	const loading = updating || resetting || badgeLoading || revoking || warning;
	const displayName = user.userNickname || user.userFullName || user._id;

	useEffect(() => {
		if (!action) return;
		setNewPassword('');
		setWarningReason('');
		setRevokeReason('');
	}, [action]);

	if (!action) return null;

	const finish = async () => {
		await sweetTopSmallSuccessAlert(t('common.success'), 1200);
		onUpdated();
		onClose();
	};

	const handleConfirm = async () => {
		try {
			switch (action) {
				case 'suspend':
					await updateUser({ variables: { input: { _id: user._id, userStatus: 'BLOCK' } } });
					break;
				case 'deleteAccount':
					await updateUser({ variables: { input: { _id: user._id, userStatus: 'DELETE' } } });
					break;
				case 'resetPassword':
					if (newPassword.length < 8) {
						await sweetErrorHandling({ message: t('userDetail.modals.passwordMin') });
						return;
					}
					await adminResetPassword({
						variables: { input: { userId: user._id, newPassword, notifyUser: false } },
					});
					break;
				case 'sendWarning':
					if (!warningReason.trim()) {
						await sweetErrorHandling({ message: t('userDetail.modals.warningReasonRequired') });
						return;
					}
					await warnUser({
						variables: { input: { userId: user._id, reason: warningReason.trim() } },
					});
					break;
				case 'removeVerification':
					await revokeVerification({
						variables: { userId: user._id, reason: revokeReason.trim() || undefined },
					});
					break;
				case 'grantPremium':
					await setBadgeLevel({ variables: { userId: user._id, badgeLevel: 'PREMIUM_PRO' } });
					break;
				case 'removePremium':
					await setBadgeLevel({
						variables: {
							userId: user._id,
							badgeLevel: user.isVerified || user.verificationStatus === 'APPROVED' ? 'VERIFIED' : 'NEW',
						},
					});
					break;
				default:
					break;
			}
			await finish();
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const titles: Record<AdminUserModalAction, string> = {
		suspend: t('userDetail.modals.suspendTitle'),
		deleteAccount: t('userDetail.modals.deleteTitle'),
		resetPassword: t('userDetail.modals.resetTitle'),
		sendWarning: t('userDetail.modals.warningTitle'),
		removeVerification: t('userDetail.modals.removeVerificationTitle'),
		grantPremium: t('userDetail.modals.grantPremiumTitle'),
		removePremium: t('userDetail.modals.removePremiumTitle'),
	};

	return (
		<div className="fixora-admin-modal-backdrop" role="presentation" onClick={onClose}>
			<div
				className="fixora-admin-modal"
				role="dialog"
				aria-modal="true"
				onClick={(e) => e.stopPropagation()}
			>
				<h3 className="fixora-admin-modal__title">{titles[action]}</h3>

				{action === 'suspend' && (
					<p className="fixora-admin-modal__body">{t('userDetail.modals.suspendBody', { name: displayName })}</p>
				)}
				{action === 'deleteAccount' && (
					<p className="fixora-admin-modal__body">{t('userDetail.modals.deleteBody', { name: displayName })}</p>
				)}
				{action === 'resetPassword' && (
					<>
						<p className="fixora-admin-modal__body">{t('userDetail.modals.resetBody')}</p>
						<label className="fixora-admin-modal__field">
							<span>{t('userDetail.modals.newPassword')}</span>
							<input
								type="password"
								className="fixora-admin-input"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								autoComplete="new-password"
							/>
						</label>
					</>
				)}
				{action === 'sendWarning' && (
					<>
						<p className="fixora-admin-modal__body">{t('userDetail.modals.warningBody', { name: displayName })}</p>
						<label className="fixora-admin-modal__field">
							<span>{t('userDetail.modals.warningReason')}</span>
							<textarea
								className="fixora-admin-input fixora-admin-input--textarea"
								value={warningReason}
								onChange={(e) => setWarningReason(e.target.value)}
								rows={3}
							/>
						</label>
					</>
				)}
				{action === 'removeVerification' && (
					<>
						<p className="fixora-admin-modal__body">
							{t('userDetail.modals.removeVerificationBody', { name: displayName })}
						</p>
						<label className="fixora-admin-modal__field">
							<span>{t('userDetail.modals.revokeReason')}</span>
							<input
								type="text"
								className="fixora-admin-input"
								value={revokeReason}
								onChange={(e) => setRevokeReason(e.target.value)}
							/>
						</label>
					</>
				)}
				{action === 'grantPremium' && (
					<p className="fixora-admin-modal__body">{t('userDetail.modals.grantPremiumBody', { name: displayName })}</p>
				)}
				{action === 'removePremium' && (
					<p className="fixora-admin-modal__body">{t('userDetail.modals.removePremiumBody', { name: displayName })}</p>
				)}

				<div className="fixora-admin-modal__actions">
					<button type="button" className="fixora-admin-btn fixora-admin-btn--ghost" onClick={onClose}>
						{t('common.cancel')}
					</button>
					<button
						type="button"
						className={`fixora-admin-btn ${action === 'deleteAccount' || action === 'suspend' ? 'fixora-admin-btn--danger' : 'fixora-admin-btn--primary'}`}
						onClick={handleConfirm}
						disabled={loading}
					>
						{t('common.confirm')}
					</button>
				</div>
			</div>
		</div>
	);
};

export default AdminUserActionModals;
