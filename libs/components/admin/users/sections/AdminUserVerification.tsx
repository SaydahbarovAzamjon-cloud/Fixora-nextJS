import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { Shield, Check, X } from 'lucide-react';
import {
	APPROVE_TECHNICIAN,
	REJECT_TECHNICIAN,
	ADD_VERIFICATION_ADMIN_NOTE,
} from '../../../../../apollo/admin/mutation';
import type { AdminUser, VerificationAuditEntry } from '../../../../types/admin/admin';
import { resolveProfileImageUrl } from '../../../../utils/profileImage';
import { runAdminVerificationApprove, runAdminVerificationReject } from '../../../../utils/adminVerificationActions';
import { dateLocale } from '../../../../utils/i18nLocale';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../../../sweetAlert';

interface Props {
	user: AdminUser;
	verificationTimeline: VerificationAuditEntry[];
	onUpdated?: () => void;
}

const AdminUserVerification: React.FC<Props> = ({ user, verificationTimeline, onUpdated }) => {
	const { t } = useTranslation('admin');
	const router = useRouter();
	const locale = dateLocale(router.locale);
	const [rejectReason, setRejectReason] = useState('');
	const [adminNote, setAdminNote] = useState('');
	const [approveTechnician, { loading: approving }] = useMutation(APPROVE_TECHNICIAN);
	const [rejectTechnician, { loading: rejecting }] = useMutation(REJECT_TECHNICIAN);
	const [addNote, { loading: noting }] = useMutation(ADD_VERIFICATION_ADMIN_NOTE);

	const formatDate = (value: string) =>
		new Date(value).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });

	const canApprove =
		user.userType === 'TECHNICIAN' &&
		(user.verificationStatus === 'UNDER_REVIEW' || user.verificationStatus === 'PENDING');

	const handleApprove = async () => {
		await runAdminVerificationApprove({
			user,
			approve: (vars) => approveTechnician({ variables: vars }),
			t,
			onSuccess: onUpdated,
		});
	};

	const handleReject = async () => {
		await runAdminVerificationReject({
			user,
			reject: (vars) => rejectTechnician({ variables: vars }),
			reason: rejectReason,
			t,
			onSuccess: () => {
				setRejectReason('');
				onUpdated?.();
			},
		});
	};

	const handleAddNote = async () => {
		if (!adminNote.trim()) return;
		try {
			await addNote({ variables: { userId: user._id, note: adminNote.trim() } });
			setAdminNote('');
			await sweetTopSmallSuccessAlert(t('common.success'), 1200);
			onUpdated?.();
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	return (
		<section id="verification" className="fixora-admin-user-section">
			<h3 className="fixora-admin-user-section__title">{t('userDetail.sections.verification')}</h3>

			<p className="fixora-admin-user-section__status">
				{t('userDetail.verification.status')}: <strong>{user.verificationStatus}</strong>
			</p>
			{user.verificationRejectionReason && (
				<p className="fixora-admin-muted">{user.verificationRejectionReason}</p>
			)}
			{user.verificationAdminNotes && (
				<p className="fixora-admin-muted">
					<strong>{t('userDetail.verification.latestNote')}:</strong> {user.verificationAdminNotes}
				</p>
			)}

			<h4 className="fixora-admin-user-section__subtitle">{t('verification.documents')}</h4>
			<div className="fixora-admin-verification__docs">
				{(user.verificationDocuments ?? []).length === 0 && (
					<p className="fixora-admin-muted">—</p>
				)}
				{(user.verificationDocuments ?? []).map((doc) => (
					<a
						key={doc}
						href={resolveProfileImageUrl(doc)}
						target="_blank"
						rel="noopener noreferrer"
						className="fixora-admin-verification__doc-card"
					>
						{doc.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
							<img src={resolveProfileImageUrl(doc)} alt="" />
						) : (
							<>
								<Shield size={24} />
								<span>{doc.split('/').pop()}</span>
							</>
						)}
					</a>
				))}
			</div>

			{(user.verificationStatus === 'PENDING' || user.verificationStatus === 'UNDER_REVIEW') && (
				<>
					<div className="fixora-admin-verification__actions">
						{canApprove && (
							<button
								type="button"
								className="fixora-admin-btn fixora-admin-btn--primary"
								onClick={handleApprove}
								disabled={approving || rejecting}
							>
								<Check size={14} /> {t('verification.approve')}
							</button>
						)}
						<button
							type="button"
							className="fixora-admin-btn fixora-admin-btn--danger-outline"
							onClick={handleReject}
							disabled={approving || rejecting}
						>
							<X size={14} /> {t('verification.reject')}
						</button>
					</div>
					<input
						type="text"
						className="fixora-admin-verification__reject-input"
						placeholder={t('verification.rejectReason')}
						value={rejectReason}
						onChange={(e) => setRejectReason(e.target.value)}
					/>
					{user.verificationStatus === 'PENDING' && (
						<p className="fixora-admin-verification__pending-notice fixora-admin-verification__pending-notice--compact">
							{t('verification.pendingRejectNote')}
						</p>
					)}
				</>
			)}

			<h4 className="fixora-admin-user-section__subtitle">{t('userDetail.verification.timeline')}</h4>
			{verificationTimeline.length === 0 ? (
				<p className="fixora-admin-muted">{t('userDetail.verification.noTimeline')}</p>
			) : (
				<ul className="fixora-admin-user-list">
					{verificationTimeline.map((entry, idx) => (
						<li key={`${entry.action}-${entry.createdAt}-${idx}`} className="fixora-admin-user-list__item">
							<strong>{entry.action}</strong>
							{entry.note && <p>{entry.note}</p>}
							<span>{formatDate(entry.createdAt)}</span>
						</li>
					))}
				</ul>
			)}

			<div className="fixora-admin-verification__note-row">
				<input
					type="text"
					className="fixora-admin-verification__reject-input"
					placeholder={t('userDetail.verification.notePlaceholder')}
					value={adminNote}
					onChange={(e) => setAdminNote(e.target.value)}
				/>
				<button
					type="button"
					className="fixora-admin-btn fixora-admin-btn--ghost fixora-admin-btn--sm"
					onClick={handleAddNote}
					disabled={noting || !adminNote.trim()}
				>
					{t('userDetail.verification.addNote')}
				</button>
			</div>
		</section>
	);
};

export default AdminUserVerification;
