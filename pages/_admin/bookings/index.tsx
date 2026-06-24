import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { Smartphone, Laptop, Tablet, Watch } from 'lucide-react';
import withAdminLayout from '../../../libs/components/layout/AdminLayout';
import { adminPageProps } from '../../../libs/i18n/adminPageProps';
import AdminHeader from '../../../libs/components/admin/AdminHeader';
import AdminSearchBar from '../../../libs/components/admin/shared/AdminSearchBar';
import AdminStatusBadge from '../../../libs/components/admin/shared/AdminStatusBadge';
import AdminPagination from '../../../libs/components/admin/shared/AdminPagination';
import AdminToolbarPills from '../../../libs/components/admin/shared/AdminToolbarPills';
import { GET_ALL_BOOKINGS_BY_ADMIN, GET_ADMIN_USER } from '../../../apollo/admin/query';
import type { AdminBooking } from '../../../libs/types/admin/admin';
import type { BookingStatus, BookingType } from '../../../libs/types/fixora/fixora';
import { displayUserName, useUserLookup } from '../../../libs/hooks/useUserLookup';
import { bookingStatusTone, bookingStatusDotClass } from '../../../libs/utils/adminBadges';
import { formatKrw } from '../../../libs/utils/formatCurrency';
import { BOOKING_STATUSES, useBookingStatusCounts } from '../../../libs/hooks/useBookingStatusCounts';

const PAGE_SIZE = 10;

const deviceIcon = (category?: string) => {
	switch (category) {
		case 'MACBOOK':
			return <Laptop size={14} />;
		case 'IPAD':
			return <Tablet size={14} />;
		case 'APPLE_WATCH':
			return <Watch size={14} />;
		default:
			return <Smartphone size={14} />;
	}
};

const AdminBookingsPage: NextPage = () => {
	const { t } = useTranslation('admin');
	const router = useRouter();
	const filterUserId = typeof router.query.userId === 'string' ? router.query.userId : undefined;
	const filterBookingId = typeof router.query.bookingId === 'string' ? router.query.bookingId : undefined;
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState(filterBookingId ?? '');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');
	const [typeFilter, setTypeFilter] = useState<BookingType | ''>('');

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedSearch(search), 350);
		return () => clearTimeout(timer);
	}, [search]);

	useEffect(() => {
		setPage(1);
	}, [debouncedSearch, statusFilter, typeFilter, filterUserId]);

	const statusCounts = useBookingStatusCounts();

	const { data: filterUserData } = useQuery(GET_ADMIN_USER, {
		variables: { userId: filterUserId },
		skip: !filterUserId,
	});
	const filterIsTechnician = filterUserData?.getUser?.userType === 'TECHNICIAN';

	const { data, loading } = useQuery(GET_ALL_BOOKINGS_BY_ADMIN, {
		variables: {
			input: {
				page,
				limit: PAGE_SIZE,
				search: {
					text: debouncedSearch || undefined,
					bookingStatus: statusFilter || undefined,
					bookingType: typeFilter || undefined,
					...(filterUserId
						? filterIsTechnician
							? { technicianId: filterUserId }
							: { userId: filterUserId }
						: {}),
				},
			},
		},
		fetchPolicy: 'cache-and-network',
		skip: Boolean(filterUserId && !filterUserData?.getUser),
	});

	const list: AdminBooking[] = data?.getAllBookingsByAdmin?.list ?? [];
	const total = data?.getAllBookingsByAdmin?.metaCounter?.[0]?.total ?? 0;
	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

	const techIds = list.map((b) => b.technicianId);
	const { name: techName } = useUserLookup(techIds);

	return (
		<>
			<AdminHeader title={t('bookings.title')} subtitle={t('bookings.subtitle')} />
			<div className="fixora-admin-page">
				<div className="fixora-admin-status-pills">
					{BOOKING_STATUSES.map((status) => (
						<button
							key={status}
							type="button"
							className={`fixora-admin-status-pills__pill${statusFilter === status ? ' fixora-admin-status-pills__pill--active' : ''}`}
							onClick={() => setStatusFilter((prev) => (prev === status ? '' : status))}
						>
							<span
								className={`fixora-admin-status-pills__dot ${bookingStatusDotClass(status)}`}
							/>
							{t(`bookings.status.${status}`)} {statusCounts[status]}
						</button>
					))}
				</div>

				<div className="fixora-admin-table-wrap">
					<div className="fixora-admin-table-toolbar fixora-admin-table-toolbar--filters">
						<AdminSearchBar value={search} onChange={setSearch} placeholder={t('bookings.searchPlaceholder')} />
						<AdminToolbarPills
							activeId={typeFilter}
							onChange={(id) => setTypeFilter(id as BookingType | '')}
							options={[
								{ id: 'SHOP_VISIT', label: t('bookings.shopVisit') },
								{
									id: 'ON_SITE',
									label: t('bookings.onSite'),
									disabled: true,
									tooltip: t('bookings.onSiteSoon'),
								},
							]}
						/>
					</div>

					<table className="fixora-admin-table">
						<thead>
							<tr>
								<th>{t('bookings.columns.id')}</th>
								<th>{t('bookings.columns.customer')}</th>
								<th>{t('bookings.columns.technician')}</th>
								<th>{t('bookings.columns.device')}</th>
								<th>{t('bookings.columns.problem')}</th>
								<th>{t('bookings.columns.status')}</th>
								<th>{t('bookings.columns.type')}</th>
								<th>{t('bookings.columns.price')}</th>
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
										{t('bookings.empty')}
									</td>
								</tr>
							)}
							{list.map((booking) => (
								<tr key={booking._id}>
									<td>
										<span className="fixora-admin-link-id">BK-{booking._id.slice(-4).toUpperCase()}</span>
									</td>
									<td>{displayUserName(booking.customerData)}</td>
									<td>{techName(booking.technicianId)}</td>
									<td>
										<span className="fixora-admin-inline-icon">
											{deviceIcon(booking.deviceData?.deviceCategory)}
											{booking.deviceData?.deviceModel || '—'}
										</span>
									</td>
									<td className="fixora-admin-cell-ellipsis">{booking.problemTitle}</td>
									<td>
										<AdminStatusBadge
											label={t(`bookings.status.${booking.bookingStatus}`)}
											tone={bookingStatusTone(booking.bookingStatus)}
										/>
									</td>
									<td>
										<AdminStatusBadge
											label={
												booking.bookingType === 'ON_SITE'
													? t('bookings.onSiteSoon')
													: t('bookings.shopVisit')
											}
											tone={booking.bookingType === 'SHOP_VISIT' ? 'info' : 'purple'}
										/>
									</td>
									<td>{formatKrw(booking.estimatedPrice ?? booking.finalPrice ?? 0)}</td>
								</tr>
							))}
						</tbody>
					</table>

					<div className="fixora-admin-table-footer">
						<span>{t('bookings.found', { count: total })}</span>
						<AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
					</div>
				</div>
			</div>
		</>
	);
};

export const getServerSideProps = adminPageProps;

export default withAdminLayout(AdminBookingsPage, { title: 'Bookings' });
