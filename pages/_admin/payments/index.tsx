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
import AdminStatCard from '../../../libs/components/admin/shared/AdminStatCard';
import { GET_ALL_PAYMENTS_BY_ADMIN, GET_ADMIN_PAYMENT_SUMMARY } from '../../../apollo/admin/query';
import type { AdminPayment } from '../../../libs/types/admin/admin';
import type { PaymentMethod, PaymentStatus, PaymentType } from '../../../libs/types/fixora/fixora';
import { useUserLookup } from '../../../libs/hooks/useUserLookup';
import { paymentStatusTone } from '../../../libs/utils/adminBadges';
import { formatKrw } from '../../../libs/utils/formatCurrency';
import { dateLocale } from '../../../libs/utils/i18nLocale';
import { TrendingUp } from 'lucide-react';

const PAGE_SIZE = 10;

const AdminPaymentsPage: NextPage = () => {
	const { t } = useTranslation('admin');
	const router = useRouter();
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState<PaymentStatus | ''>('');
	const [methodFilter, setMethodFilter] = useState<PaymentMethod | ''>('');
	const [typeFilter, setTypeFilter] = useState<PaymentType | ''>('');

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedSearch(search), 350);
		return () => clearTimeout(timer);
	}, [search]);

	useEffect(() => {
		setPage(1);
	}, [debouncedSearch, statusFilter, methodFilter, typeFilter]);

	const { data: summaryData } = useQuery(GET_ADMIN_PAYMENT_SUMMARY, {
		fetchPolicy: 'cache-and-network',
	});

	const summary = summaryData?.getAdminPaymentSummary;

	const { data, loading } = useQuery(GET_ALL_PAYMENTS_BY_ADMIN, {
		variables: {
			input: {
				page,
				limit: PAGE_SIZE,
				search: {
					bookingId: debouncedSearch || undefined,
					paymentStatus: statusFilter || undefined,
					paymentMethod: methodFilter || undefined,
					paymentType: typeFilter || undefined,
				},
			},
		},
		fetchPolicy: 'cache-and-network',
	});

	const list: AdminPayment[] = data?.getAllPaymentsByAdmin?.list ?? [];
	const total = data?.getAllPaymentsByAdmin?.metaCounter?.[0]?.total ?? 0;
	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

	const payerIds = list.map((p) => p.userId);
	const { name: payerName } = useUserLookup(payerIds);

	return (
		<>
			<AdminHeader title={t('payments.title')} subtitle={t('payments.subtitle')} />
			<div className="fixora-admin-page">
				<div className="fixora-admin-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
					<AdminStatCard
						icon={<TrendingUp size={18} />}
						label={t('payments.summary.revenue')}
						value={formatKrw(summary?.totalRevenue ?? 0)}
						iconTone="primary"
					/>
					<AdminStatCard
						icon={<TrendingUp size={18} />}
						label={t('payments.summary.pending')}
						value={formatKrw(summary?.pendingAmount ?? 0)}
						subtext={t('payments.summary.count', { count: summary?.pendingCount ?? 0 })}
						iconTone="warning"
					/>
					<AdminStatCard
						icon={<TrendingUp size={18} />}
						label={t('payments.summary.refunded')}
						value={formatKrw(summary?.refundedAmount ?? 0)}
						subtext={t('payments.summary.count', { count: summary?.refundedCount ?? 0 })}
						iconTone="info"
					/>
					<AdminStatCard
						icon={<TrendingUp size={18} />}
						label={t('payments.summary.failed')}
						value={formatKrw(summary?.failedAmount ?? 0)}
						subtext={t('payments.summary.count', { count: summary?.failedCount ?? 0 })}
						iconTone="danger"
					/>
				</div>

				<div className="fixora-admin-table-wrap">
					<div className="fixora-admin-table-toolbar">
						<AdminSearchBar value={search} onChange={setSearch} placeholder={t('payments.searchPlaceholder')} />
						<select
							className="fixora-admin-select"
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | '')}
						>
							<option value="">{t('payments.allStatuses')}</option>
							<option value="COMPLETED">COMPLETED</option>
							<option value="PENDING">PENDING</option>
							<option value="FAILED">FAILED</option>
							<option value="REFUNDED">REFUNDED</option>
						</select>
						<select
							className="fixora-admin-select"
							value={methodFilter}
							onChange={(e) => setMethodFilter(e.target.value as PaymentMethod | '')}
						>
							<option value="">{t('payments.allMethods')}</option>
							<option value="KAKAOPAY">KAKAOPAY</option>
							<option value="CARD">CARD</option>
							<option value="CASH">CASH</option>
						</select>
						<select
							className="fixora-admin-select"
							value={typeFilter}
							onChange={(e) => setTypeFilter(e.target.value as PaymentType | '')}
						>
							<option value="">{t('payments.allTypes')}</option>
							<option value="DEPOSIT">DEPOSIT</option>
							<option value="FINAL">FINAL</option>
						</select>
					</div>

					<table className="fixora-admin-table">
						<thead>
							<tr>
								<th>{t('payments.columns.paymentId')}</th>
								<th>{t('payments.columns.bookingId')}</th>
								<th>{t('payments.columns.payer')}</th>
								<th>{t('payments.columns.type')}</th>
								<th>{t('payments.columns.method')}</th>
								<th>{t('payments.columns.amount')}</th>
								<th>{t('payments.columns.status')}</th>
								<th>{t('payments.columns.transactionId')}</th>
								<th>{t('payments.columns.date')}</th>
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
										{t('payments.empty')}
									</td>
								</tr>
							)}
							{list.map((payment) => (
								<tr key={payment._id}>
									<td>
										<span className="fixora-admin-link-id">PAY-{payment._id.slice(-4).toUpperCase()}</span>
									</td>
									<td>BK-{payment.bookingId.slice(-4).toUpperCase()}</td>
									<td>{payerName(payment.userId)}</td>
									<td>
										<AdminStatusBadge label={payment.paymentType} tone="info" />
									</td>
									<td>
										<AdminStatusBadge label={payment.paymentMethod} tone="yellow" />
									</td>
									<td>{formatKrw(payment.paymentAmount)}</td>
									<td>
										<AdminStatusBadge
											label={payment.paymentStatus}
											tone={paymentStatusTone(payment.paymentStatus)}
										/>
									</td>
									<td>{payment.transactionId || '—'}</td>
									<td>
										{new Date(payment.createdAt).toLocaleDateString(dateLocale(router.locale), {
											year: 'numeric',
											month: '2-digit',
											day: '2-digit',
										})}
									</td>
								</tr>
							))}
						</tbody>
					</table>

					<div className="fixora-admin-table-footer">
						<span>{total} payments</span>
						<AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
					</div>
				</div>
			</div>
		</>
	);
};

export const getServerSideProps = adminPageProps;

export default withAdminLayout(AdminPaymentsPage, { title: 'Payments' });
