import React, { useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery } from '@apollo/client';
import { Check, X, Shield, Mail, Phone, MapPin } from 'lucide-react';
import withAdminLayout from '../../../libs/components/layout/AdminLayout';
import { adminPageProps } from '../../../libs/i18n/adminPageProps';
import AdminHeader from '../../../libs/components/admin/AdminHeader';
import AdminFilterTabs from '../../../libs/components/admin/shared/AdminFilterTabs';
import AdminStatusBadge from '../../../libs/components/admin/shared/AdminStatusBadge';
import AdminSearchBar from '../../../libs/components/admin/shared/AdminSearchBar';
import { GET_TECHNICIAN_VERIFICATION_QUEUE } from '../../../apollo/admin/query';
import { APPROVE_TECHNICIAN, REJECT_TECHNICIAN } from '../../../apollo/admin/mutation';
import type { AdminUser, VerificationStatus } from '../../../libs/types/admin/admin';
import { displayUserName } from '../../../libs/hooks/useUserLookup';
import { resolveProfileImageUrl } from '../../../libs/utils/profileImage';
import { buildVerificationCompleteness } from '../../../libs/utils/adminVerification';
import { verificationStatusTone } from '../../../libs/utils/adminBadges';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../../libs/sweetAlert';
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

	const handleApprove = async () => {
		if (!selected) return;
		try {
			await approveTechnician({ variables: { userId: selected._id } });
			await sweetTopSmallSuccessAlert(t('common.success'), 1200);
			await refetch();
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const handleReject = async () => {
		if (!selected) return;
		try {
			await rejectTechnician({ variables: { userId: selected._id, reason: rejectReason || undefined } });
			await sweetTopSmallSuccessAlert(t('common.success'), 1200);
			setRejectReason('');
			await refetch();
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const completeness = selected ? buildVerificationCompleteness(selected) : [];

	return (
		<>
			<AdminHeader title={t('verification.title')} subtitle={t('verification.subtitle')} />
			<div className="fixora-admin-page">
				<AdminFilterTabs tabs={tabs} activeId={activeTab} onChange={(id) => setActiveTab(id as FilterTab)} />

				<div className="fixora-admin-search" style={{ marginBottom: 16, maxWidth: '100%' }}>
					<AdminSearchBar value={search} onChange={setSearch} placeholder={t('users.searchPlaceholder')} />
				</div>

				<div className="fixora-admin-verification">
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
									<div className="fixora-admin-table-user__avatar">{initial}</div>
									<div style={{ flex: 1, minWidth: 0 }}>
										<div className="fixora-admin-table-user__name">{name}</div>
										<div style={{ fontSize: 12, color: 'var(--fixora-text-muted)' }}>
											{tech.shopName} · {tech.specialty}
										</div>
										<div style={{ fontSize: 11, color: 'var(--fixora-text-muted)', marginTop: 4 }}>
											{tech.userLocation}
										</div>
									</div>
									<div style={{ textAlign: 'right' }}>
										<AdminStatusBadge
											label={tech.verificationStatus}
											tone={verificationStatusTone(tech.verificationStatus)}
										/>
										<div style={{ fontSize: 11, color: 'var(--fixora-text-muted)', marginTop: 8 }}>
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
								<div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}>
									<div className="fixora-admin-table-user__avatar" style={{ width: 56, height: 56, fontSize: 20 }}>
										<img src={resolveProfileImageUrl(selected.userProfileImage)} alt="" />
									</div>
									<div>
										<h3 style={{ margin: '0 0 8px', fontSize: 18 }}>{displayUserName(selected)}</h3>
										<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
											<AdminStatusBadge
												label={selected.verificationStatus}
												tone={verificationStatusTone(selected.verificationStatus)}
											/>
											<AdminStatusBadge label={t('verification.newAccount')} tone="neutral" />
										</div>
									</div>
								</div>

								<div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, marginBottom: 16 }}>
									{selected.userEmail && (
										<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
											<Mail size={14} /> {selected.userEmail}
										</span>
									)}
									{selected.userPhoneNumber && (
										<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
											<Phone size={14} /> {selected.userPhoneNumber}
										</span>
									)}
									{selected.userLocation && (
										<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
											<MapPin size={14} /> {selected.userLocation}
										</span>
									)}
								</div>

								<p style={{ fontSize: 12, color: 'var(--fixora-text-muted)', marginBottom: 8 }}>
									{t('verification.fields.shop')}: {selected.shopName || '—'} · {t('verification.fields.specialty')}:{' '}
									{selected.specialty || '—'} · {t('verification.fields.experience')}: {selected.yearsExperience ?? 0}y
								</p>

								{selected.userBio && (
									<p style={{ fontSize: 13, color: 'var(--fixora-text-secondary)', marginBottom: 16 }}>{selected.userBio}</p>
								)}

								<h4 style={{ margin: '0 0 8px', fontSize: 14 }}>{t('verification.documents')}</h4>
								<div className="fixora-admin-verification__docs">
									{(selected.verificationDocuments ?? []).length === 0 && (
										<div className="fixora-admin-empty" style={{ gridColumn: '1 / -1', padding: 20 }}>
											—
										</div>
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

								<h4 style={{ margin: '16px 0 8px', fontSize: 14 }}>{t('verification.completenessTitle')}</h4>
								<div className="fixora-admin-verification__checklist">
									{completeness.map((item) => (
										<div key={item.key} className="fixora-admin-verification__check-item">
											{item.done ? <Check size={14} color="#52c41a" /> : <X size={14} color="#8a8a8a" />}
											{t(item.labelKey)}
										</div>
									))}
								</div>

								{(selected.verificationStatus === 'UNDER_REVIEW' || selected.verificationStatus === 'PENDING') && (
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
											className="fixora-admin-search__input"
											style={{ marginTop: 10, width: '100%' }}
											placeholder={t('verification.rejectReason')}
											value={rejectReason}
											onChange={(e) => setRejectReason(e.target.value)}
										/>
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
