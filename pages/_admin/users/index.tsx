import React, { useEffect, useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import withAdminLayout from '../../../libs/components/layout/AdminLayout';
import { adminPageProps } from '../../../libs/i18n/adminPageProps';
import AdminHeader from '../../../libs/components/admin/AdminHeader';
import AdminSearchBar from '../../../libs/components/admin/shared/AdminSearchBar';
import AdminStatusBadge from '../../../libs/components/admin/shared/AdminStatusBadge';
import AdminPagination from '../../../libs/components/admin/shared/AdminPagination';
import { GET_ALL_USERS_BY_ADMIN } from '../../../apollo/admin/query';
import type { AdminUser, AdminUserStatus, AdminUserType } from '../../../libs/types/admin/admin';
import { displayUserName } from '../../../libs/hooks/useUserLookup';
import { resolveProfileImageUrl } from '../../../libs/utils/profileImage';
import { userRoleTone, userStatusTone } from '../../../libs/utils/adminBadges';
import { dateLocale } from '../../../libs/utils/i18nLocale';
import { Star } from 'lucide-react';

const PAGE_SIZE = 10;

const AdminUsersPage: NextPage = () => {
	const { t } = useTranslation('admin');
	const router = useRouter();
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const [roleFilter, setRoleFilter] = useState<AdminUserType | ''>('');
	const [statusFilter, setStatusFilter] = useState<AdminUserStatus | ''>('');

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedSearch(search), 350);
		return () => clearTimeout(timer);
	}, [search]);

	useEffect(() => {
		setPage(1);
	}, [debouncedSearch, roleFilter, statusFilter]);

	const { data, loading } = useQuery(GET_ALL_USERS_BY_ADMIN, {
		variables: {
			input: {
				page,
				limit: PAGE_SIZE,
				search: {
					text: debouncedSearch || undefined,
					userType: roleFilter || undefined,
					userStatus: statusFilter || undefined,
				},
			},
		},
		fetchPolicy: 'cache-and-network',
	});

	const list: AdminUser[] = data?.getAllUsersByAdmin?.list ?? [];
	const total = data?.getAllUsersByAdmin?.metaCounter?.[0]?.total ?? 0;
	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

	const badgeLabel = (level: string) => {
		const key = `users.badges.${level}` as const;
		return t(key, { defaultValue: level });
	};

	return (
		<>
			<AdminHeader title={t('users.title')} subtitle={t('users.subtitle')} />
			<div className="fixora-admin-page">
				<div className="fixora-admin-table-wrap">
					<div className="fixora-admin-table-toolbar">
						<AdminSearchBar value={search} onChange={setSearch} placeholder={t('users.searchPlaceholder')} />
						<select
							className="fixora-admin-select"
							value={roleFilter}
							onChange={(e) => setRoleFilter(e.target.value as AdminUserType | '')}
						>
							<option value="">{t('users.allRoles')}</option>
							<option value="USER">{t('users.roles.USER')}</option>
							<option value="TECHNICIAN">{t('users.roles.TECHNICIAN')}</option>
							<option value="ADMIN">{t('users.roles.ADMIN')}</option>
						</select>
						<select
							className="fixora-admin-select"
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value as AdminUserStatus | '')}
						>
							<option value="">{t('users.allStatuses')}</option>
							<option value="ACTIVE">{t('users.statuses.ACTIVE')}</option>
							<option value="BLOCK">{t('users.statuses.BLOCK')}</option>
							<option value="DELETE">{t('users.statuses.DELETE')}</option>
						</select>
					</div>

					<table className="fixora-admin-table">
						<thead>
							<tr>
								<th>{t('users.columns.user')}</th>
								<th>{t('users.columns.email')}</th>
								<th>{t('users.columns.phone')}</th>
								<th>{t('users.columns.role')}</th>
								<th>{t('users.columns.status')}</th>
								<th>{t('users.columns.badge')}</th>
								<th>{t('users.columns.rating')}</th>
								<th>{t('users.columns.joined')}</th>
							</tr>
						</thead>
						<tbody>
							{loading && (
								<tr>
									<td colSpan={8} className="fixora-admin-empty">
										{t('common.loading')}
									</td>
								</tr>
							)}
							{!loading && list.length === 0 && (
								<tr>
									<td colSpan={8} className="fixora-admin-empty">
										{t('users.empty')}
									</td>
								</tr>
							)}
							{list.map((user) => {
								const name = displayUserName(user);
								const initial = name.charAt(0).toUpperCase();
								return (
									<tr key={user._id}>
										<td>
											<div className="fixora-admin-table-user">
												<div className="fixora-admin-table-user__avatar">
													<img src={resolveProfileImageUrl(user.userProfileImage)} alt="" />
												</div>
												<span className="fixora-admin-table-user__name">{name}</span>
											</div>
										</td>
										<td>{user.userEmail || '—'}</td>
										<td>{user.userPhoneNumber || '—'}</td>
										<td>
											<AdminStatusBadge label={t(`users.roles.${user.userType}`)} tone={userRoleTone(user.userType)} />
										</td>
										<td>
											<AdminStatusBadge
												label={t(`users.statuses.${user.userStatus}`)}
												tone={userStatusTone(user.userStatus)}
											/>
										</td>
										<td>
											{user.badgeLevel && user.badgeLevel !== 'NEW' ? (
												<AdminStatusBadge label={badgeLabel(user.badgeLevel)} tone="info" />
											) : (
												'—'
											)}
										</td>
										<td>
											{user.userType === 'TECHNICIAN' ? (
												<span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
													<Star size={12} color="#faad14" fill="#faad14" />
													{user.averageRating?.toFixed(1) ?? '0.0'}
												</span>
											) : (
												'—'
											)}
										</td>
										<td>
											{new Date(user.createdAt).toLocaleDateString(dateLocale(router.locale), {
												year: 'numeric',
												month: '2-digit',
												day: '2-digit',
											})}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>

					<div className="fixora-admin-table-footer">
						<span>
							{t('users.showing', {
								from: total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1,
								to: Math.min(page * PAGE_SIZE, total),
								total,
							})}
						</span>
						<AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
					</div>
				</div>
			</div>
		</>
	);
};

export const getServerSideProps = adminPageProps;

export default withAdminLayout(AdminUsersPage, { title: 'Users' });
