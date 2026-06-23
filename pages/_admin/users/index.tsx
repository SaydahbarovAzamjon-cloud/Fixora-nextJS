import React, { useEffect, useState } from 'react';
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
import AdminSelect from '../../../libs/components/admin/shared/AdminSelect';
import AdminToolbarPills from '../../../libs/components/admin/shared/AdminToolbarPills';
import AdminUserBadgeStack from '../../../libs/components/admin/users/AdminUserBadgeStack';
import AdminUserActionsMenu from '../../../libs/components/admin/users/AdminUserActionsMenu';
import AdminUserStatusMenu from '../../../libs/components/admin/users/AdminUserStatusMenu';
import { GET_ALL_USERS_BY_ADMIN } from '../../../apollo/admin/query';
import type { AdminUser, AdminUserStatus, AdminUserType } from '../../../libs/types/admin/admin';
import { displayUserName } from '../../../libs/hooks/useUserLookup';
import { resolveProfileImageUrl } from '../../../libs/utils/profileImage';
import { userRoleTone } from '../../../libs/utils/adminBadges';
import { dateLocale } from '../../../libs/utils/i18nLocale';
import { Star } from 'lucide-react';

const PAGE_SIZE = 10;

function roleLabel(userType: AdminUserType, t: (key: string) => string): string {
	switch (userType) {
		case 'USER':
			return t('users.roles.CLIENT');
		case 'TECHNICIAN':
			return t('users.roles.TECHNICIAN');
		case 'ADMIN':
			return t('users.roles.ADMIN');
		default:
			return userType;
	}
}

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

	const { data, loading, refetch } = useQuery(GET_ALL_USERS_BY_ADMIN, {
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

	return (
		<>
			<AdminHeader title={t('users.title')} subtitle={t('users.subtitle')} />
			<div className="fixora-admin-page">
				<div className="fixora-admin-table-wrap">
					<div className="fixora-admin-table-toolbar fixora-admin-table-toolbar--filters">
						<AdminSearchBar value={search} onChange={setSearch} placeholder={t('users.searchPlaceholder')} />
						<AdminToolbarPills
							className="fixora-admin-toolbar-pills--uniform"
							activeId={roleFilter}
							onChange={(id) => setRoleFilter(id as AdminUserType | '')}
							options={[
								{ id: 'ADMIN', label: t('users.roles.ADMIN') },
								{ id: 'TECHNICIAN', label: t('users.roles.TECHNICIAN') },
								{ id: 'USER', label: t('users.roles.CLIENT') },
							]}
						/>
						<AdminSelect
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value as AdminUserStatus | '')}
							options={[
								{ value: '', label: t('users.allStatuses') },
								{ value: 'ACTIVE', label: t('users.statuses.ACTIVE') },
								{ value: 'BLOCK', label: t('users.statuses.BLOCK') },
								{ value: 'DELETE', label: t('users.statuses.DELETE') },
							]}
							aria-label={t('users.allStatuses')}
						/>
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
								<th>{t('users.columns.actions')}</th>
							</tr>
						</thead>
						<tbody>
							{loading && (
								<tr>
									<td colSpan={9} className="fixora-admin-empty">
										{t('common.loading')}
									</td>
								</tr>
							)}
							{!loading && list.length === 0 && (
								<tr>
									<td colSpan={9} className="fixora-admin-empty">
										{t('users.empty')}
									</td>
								</tr>
							)}
							{list.map((user) => {
								const name = displayUserName(user);
								return (
									<tr key={user._id}>
										<td>
											<button
												type="button"
												className="fixora-admin-table-user fixora-admin-table-user--link"
												onClick={() => router.push(`/_admin/users/${user._id}`)}
											>
												<div className="fixora-admin-table-user__avatar">
													<img src={resolveProfileImageUrl(user.userProfileImage)} alt="" />
												</div>
												<span className="fixora-admin-table-user__name">{name}</span>
											</button>
										</td>
										<td>{user.userEmail || '—'}</td>
										<td>{user.userPhoneNumber || '—'}</td>
										<td>
											<AdminStatusBadge label={roleLabel(user.userType, t)} tone={userRoleTone(user.userType)} />
										</td>
										<td>
											<AdminUserStatusMenu user={user} onUpdated={() => refetch()} />
										</td>
										<td>
											<AdminUserBadgeStack user={user} compact />
										</td>
										<td>
											{user.userType === 'TECHNICIAN' ? (
												<span className="fixora-admin-rating">
													<Star size={12} fill="currentColor" />
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
										<td>
											<AdminUserActionsMenu user={user} onUpdated={() => refetch()} compact />
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
