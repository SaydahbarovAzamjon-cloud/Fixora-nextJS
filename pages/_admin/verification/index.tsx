import React, { useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery, useApolloClient } from '@apollo/client';
import { Check, X, Shield, Mail, Phone, MapPin } from 'lucide-react';
import withAdminLayout from '../../../libs/components/layout/AdminLayout';
import { adminPageProps } from '../../../libs/i18n/adminPageProps';
import AdminHeader from '../../../libs/components/admin/AdminHeader';
import AdminFilterTabs from '../../../libs/components/admin/shared/AdminFilterTabs';
import AdminStatusBadge from '../../../libs/components/admin/shared/AdminStatusBadge';
import AdminUserBadgeStack from '../../../libs/components/admin/users/AdminUserBadgeStack';
import AdminSearchBar from '../../../libs/components/admin/shared/AdminSearchBar';
import { GET_TECHNICIAN_VERIFICATION_QUEUE } from '../../../apollo/admin/query';
import { APPROVE_TECHNICIAN, REJECT_TECHNICIAN } from '../../../apollo/admin/mutation';
import type { AdminUser, VerificationStatus } from '../../../libs/types/admin/admin';
import { displayUserName } from '../../../libs/hooks/useUserLookup';
import { resolveProfileImageUrl, hasRealProfileImage } from '../../../libs/utils/profileImage';
import { buildVerificationCompleteness } from '../../../libs/utils/adminVerification';
import { runAdminVerificationApprove, runAdminVerificationReject } from '../../../libs/utils/adminVerificationActions';
import { verificationStatusTone } from '../../../libs/utils/adminBadges';
import { dateLocale } from '../../../libs/utils/i18nLocale';
import { useRouter } from 'next/router';

type FilterTab = 'all' | 'pending' | 'underReview' | 'approved' | 'rejected';

const TAB_STATUS: Record<FilterTab, VerificationStatus | undefined> = {
	all: undefined,
	pending: 'PENDING',
	underReview: 'UNDER_REVIEW',
	approved: 'APPROVED',
	rejected: 'REJECTED',
};

const AdminVerificationPage: NextPage = () => {
	const { t } = useTranslation('admin');
	const router = useRouter();
	const client = useApolloClient();
	const [activeTab, setActiveTab] = useState<FilterTab>('underReview');
	const [search, setSearch] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [rejectReason, setRejectReason] = useState('');

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedSearch(search), 350);
		return () => clearTimeout(timer);
	}, [search]);

	const verificationStatus = TAB_STATUS[activeTab];

	const { data, loading, refetch } = useQuery(GET_TECHNICIAN_VERIFICATION_QUEUE, {
		variables: {
			input: {
				page: 1,
				limit: 50,
				search: {
					text: debouncedSearch || undefined,
					...(verificationStatus ? { verificationStatus } : {}),
				},
			},
		},
		fetchPolicy: 'cache-and-network',
	});

	const [approveTechnician, { loading: approving }] = useMutation(APPROVE_TECHNICIAN);
	const [rejectTechnician, { loading: rejecting }] = useMutation(REJECT_TECHNICIAN);

	const list: AdminUser[] = data?.getTechnicianVerificationQueue?.list ?? [];

	const selected = useMemo(
		() => list.find((u) => u._id === selectedId) ?? list[0] ?? null,
		[list, selectedId],
	);

	const tabs = [
		{ id: 'all', label: t('verification.tabs.all') },
		{ id: 'pending', label: t('verification.tabs.pending') },
		{ id: 'underReview', label: t('verification.tabs.underReview') },
		{ id: 'approved', label: t('verification.tabs.approved') },
		{ id: 'rejected', label: t('verification.tabs.rejected') },
	];

	const refetchVerificationQueues = async () => {
		await refetch();
		await client.refetchQueries({ include: [GET_TECHNICIAN_VERIFICATION_QUEUE] });
	};

	const handleApprove = async () => {
		if (!selected) return;
		await runAdminVerificationApprove({
			user: selected,
			approve: (vars) =>
				approveTechnician({
					variables: vars,
					refetchQueries: [{ query: GET_TECHNICIAN_VERIFICATION_QUEUE }],
				}),
			t,
			onSuccess: async () => {
				setSelectedId(null);
				await refetchVerificationQueues();
			},
		});
	};

	const handleReject = async () => {
		if (!selected) return;
		await runAdminVerificationReject({
			user: selected,
			reject: (vars) =>
				rejectTechnician({
					variables: vars,
					refetchQueries: [{ query: GET_TECHNICIAN_VERIFICATION_QUEUE }],
				}),
			t,
			reason: rejectReason,
			onSuccess: async () => {
				setRejectReason('');
				setSelectedId(null);
				await refetchVerificationQueues();
			},
		});
	};

	const completeness = selected ? buildVerificationCompleteness(selected) : [];

	return (
		<>
			<AdminHeader title={t('verification.title')} subtitle={t('verification.subtitle')} />
			<div className="fixora-admin-page">
				<AdminFilterTabs tabs={tabs} activeId={activeTab} onChange={(id) => setActiveTab(id as FilterTab)} />

				<div className="fixora-admin-verification">
					<div className="fixora-admin-verification__search-row">
						<AdminSearchBar value={search} onChange={setSearch} placeholder={t('users.searchPlaceholder')} />
					</div>

					<div className="fixora-admin-verification__list">
						{loading && <div className="fixora-admin-empty">{t('common.loading')}</div>}
						{!loading && list.length === 0 && <div className="fixora-admin-empty">{t('verification.empty')}</div>}
						{list.map((tech) => {
							const name = displayUserName(tech);
							const initial = name.charAt(0).toUpperCase();
							const active = selected?._id === tech._id;
							return (
								<button
									key={tech._id}
									type="button"
									className={`fixora-admin-verification__list-item${active ? ' fixora-admin-verification__list-item--active' : ''}`}
									onClick={() => setSelectedId(tech._id)}
								>
									<div className="fixora-admin-table-user__avatar">
										{hasRealProfileImage(tech.userProfileImage) ? (
											<img src={resolveProfileImageUrl(tech.userProfileImage)} alt="" />
										) : (
											initial
										)}
									</div>
									<div className="fixora-admin-verification__list-body">
										<div className="fixora-admin-table-user__name">{name}</div>
										<div className="fixora-admin-verification__list-meta">
											{tech.shopName} · {tech.specialty}
										</div>
										<div className="fixora-admin-verification__list-meta fixora-admin-verification__list-meta--spaced">
											{tech.userLocation}
										</div>
									</div>
									<div className="fixora-admin-verification__list-aside">
										<AdminStatusBadge
											label={tech.verificationStatus}
											tone={verificationStatusTone(tech.verificationStatus)}
										/>
										<AdminUserBadgeStack user={tech} compact />
										<div className="fixora-admin-verification__list-date">
											{new Date(tech.createdAt).toLocaleDateString(dateLocale(router.locale), {
												year: 'numeric',
												month: '2-digit',
												day: '2-digit',
											})}
										</div>
									</div>
								</button>
							);
						})}
					</div>

					<div className="fixora-admin-verification__detail">
						{!selected ? (
							<div className="fixora-admin-empty">{t('verification.empty')}</div>
						) : (
							<>
								<div className="fixora-admin-verification__profile">
									<div className="fixora-admin-table-user__avatar fixora-admin-verification__profile-avatar">
										{hasRealProfileImage(selected.userProfileImage) ? (
											<img src={resolveProfileImageUrl(selected.userProfileImage)} alt="" />
										) : (
											displayUserName(selected).charAt(0).toUpperCase()
										)}
									</div>
									<div>
										<h3 className="fixora-admin-verification__profile-name">{displayUserName(selected)}</h3>
										<div className="fixora-admin-verification__badges">
											<AdminStatusBadge
												label={selected.verificationStatus}
												tone={verificationStatusTone(selected.verificationStatus)}
											/>
											<AdminUserBadgeStack user={selected} compact />
											<AdminStatusBadge label={t('verification.newAccount')} tone="neutral" />
										</div>
									</div>
								</div>

								<div className="fixora-admin-verification__contact">
									{selected.userEmail && (
										<span className="fixora-admin-verification__contact-row">
											<Mail size={14} /> {selected.userEmail}
										</span>
									)}
									{selected.userPhoneNumber && (
										<span className="fixora-admin-verification__contact-row">
											<Phone size={14} /> {selected.userPhoneNumber}
										</span>
									)}
									{selected.userLocation && (
										<span className="fixora-admin-verification__contact-row">
											<MapPin size={14} /> {selected.userLocation}
										</span>
									)}
								</div>

								<p className="fixora-admin-verification__list-meta fixora-admin-verification__profile-meta">
									{t('verification.fields.shop')}: {selected.shopName || '—'} · {t('verification.fields.specialty')}:{' '}
									{selected.specialty || '—'} · {t('verification.fields.experience')}: {selected.yearsExperience ?? 0}y
								</p>

								{selected.userBio && <p className="fixora-admin-verification__bio">{selected.userBio}</p>}

								<h4 className="fixora-admin-verification__section-title">{t('verification.documents')}</h4>
								<div className="fixora-admin-verification__docs">
									{(selected.verificationDocuments ?? []).length === 0 && (
										<div className="fixora-admin-empty fixora-admin-verification__docs-empty">—</div>
									)}
									{(selected.verificationDocuments ?? []).map((doc) => (
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

								<h4 className="fixora-admin-verification__section-title fixora-admin-verification__section-title--spaced">
									{t('verification.completenessTitle')}
								</h4>
								<div className="fixora-admin-verification__checklist">
									{completeness.map((item) => (
										<div key={item.key} className="fixora-admin-verification__check-item">
											{item.done ? (
												<Check size={14} className="fixora-admin-check-icon--done" />
											) : (
												<X size={14} className="fixora-admin-check-icon--pending" />
											)}
											{t(item.labelKey)}
										</div>
									))}
								</div>

								{(selected.verificationStatus === 'PENDING' || selected.verificationStatus === 'UNDER_REVIEW') && (
									<>
										<div className="fixora-admin-verification__actions">
											<button
												type="button"
												className="fixora-admin-btn fixora-admin-btn--primary"
												onClick={handleApprove}
												disabled={approving || rejecting}
											>
												{t('verification.approve')}
											</button>
											<button
												type="button"
												className="fixora-admin-btn fixora-admin-btn--danger-outline"
												onClick={handleReject}
												disabled={approving || rejecting}
											>
												{t('verification.reject')}
											</button>
										</div>
										<input
											type="text"
											className="fixora-admin-verification__reject-input"
											placeholder={t('verification.rejectReason')}
											value={rejectReason}
											onChange={(e) => setRejectReason(e.target.value)}
										/>
										{selected.verificationStatus === 'PENDING' && (
											<p className="fixora-admin-verification__pending-notice fixora-admin-verification__pending-notice--compact">
												{t('verification.pendingRejectNote')}
											</p>
										)}
									</>
								)}
							</>
						)}
					</div>
				</div>
			</div>
		</>
	);
};

export const getServerSideProps = adminPageProps;

export default withAdminLayout(AdminVerificationPage, { title: 'Verification' });
