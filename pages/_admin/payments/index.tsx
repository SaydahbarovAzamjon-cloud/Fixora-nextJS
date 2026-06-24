import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import withAdminLayout from '../../../libs/components/layout/AdminLayout';
import { adminPageProps } from '../../../libs/i18n/adminPageProps';
import AdminHeader from '../../../libs/components/admin/AdminHeader';
import AdminSearchBar from '../../../libs/components/admin/shared/AdminSearchBar';
import AdminStatusBadge from '../../../libs/components/admin/shared/AdminStatusBadge';
import AdminPagination from '../../../libs/components/admin/shared/AdminPagination';
import AdminStatCard from '../../../libs/components/admin/shared/AdminStatCard';
import AdminSelect from '../../../libs/components/admin/shared/AdminSelect';
import { GET_ALL_PAYMENTS_BY_ADMIN, GET_ADMIN_PAYMENT_SUMMARY, GET_ADMIN_USER } from '../../../apollo/admin/query';
import { REFUND_PAYMENT } from '../../../apollo/admin/mutation';
import type { AdminPayment } from '../../../libs/types/admin/admin';
import type { PaymentMethod, PaymentStatus, PaymentType } from '../../../libs/types/fixora/fixora';
import { useUserLookup } from '../../../libs/hooks/useUserLookup';
import { paymentStatusTone } from '../../../libs/utils/adminBadges';
import { formatKrw } from '../../../libs/utils/formatCurrency';
import { dateLocale } from '../../../libs/utils/i18nLocale';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../../libs/sweetAlert';
import { TrendingUp } from 'lucide-react';

const PAGE_SIZE = 10;

const AdminPaymentsPage: NextPage = () => {
	const { t } = useTranslation('admin');
	const router = useRouter();
	const filterUserId = typeof router.query.userId === 'string' ? router.query.userId : undefined;
	const filterPaymentId = typeof router.query.paymentId === 'string' ? router.query.paymentId : undefined;
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState(filterPaymentId ?? '');
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
	}, [debouncedSearch, statusFilter, methodFilter, typeFilter, filterUserId]);

	const { data: summaryData } = useQuery(GET_ADMIN_PAYMENT_SUMMARY, {
		fetchPolicy: 'cache-and-network',
	});

	const summary = summaryData?.getAdminPaymentSummary;

	const { data: filterUserData } = useQuery(GET_ADMIN_USER, {
		variables: { userId: filterUserId },
		skip: !filterUserId,
	});
	const filterIsTechnician = filterUserData?.getUser?.userType === 'TECHNICIAN';

	const { data, loading, refetch } = useQuery(GET_ALL_PAYMENTS_BY_ADMIN, {
		variables: {
			input: {
				page,
				limit: PAGE_SIZE,
				search: {
					bookingId: debouncedSearch || undefined,
					paymentStatus: statusFilter || undefined,
					paymentMethod: methodFilter || undefined,
					paymentType: typeFilter || undefined,
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

	const [refundPayment, { loading: refunding }] = useMutation(REFUND_PAYMENT);

	const list: AdminPayment[] = data?.getAllPaymentsByAdmin?.list ?? [];
	const total = data?.getAllPaymentsByAdmin?.metaCounter?.[0]?.total ?? 0;
	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

	const payerIds = list.map((p) => p.userId);
	const { name: payerName } = useUserLookup(payerIds);

	const handleRefund = async (paymentId: string) => {
		try {
			await refundPayment({ variables: { paymentId } });
			await sweetTopSmallSuccessAlert(t('common.success'), 1200);
			await refetch();
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	return (
		<>
			<AdminHeader title={t('payments.title')} subtitle={t('payments.subtitle')} />
			<div className="fixora-admin-page">
				<div className="fixora-admin-stats-grid fixora-admin-stats-grid--4">
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
						<AdminSelect
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | '')}
							options={[
								{ value: '', label: t('payments.allStatuses') },
								{ value: 'COMPLETED', label: 'COMPLETED' },
								{ value: 'PENDING', label: 'PENDING' },
								{ value: 'FAILED', label: 'FAILED' },
								{ value: 'REFUNDED', label: 'REFUNDED' },
							]}
							aria-label={t('payments.allStatuses')}
						/>
						<AdminSelect
							value={methodFilter}
							onChange={(e) => setMethodFilter(e.target.value as PaymentMethod | '')}
							options={[
								{ value: '', label: t('payments.allMethods') },
								{ value: 'KAKAOPAY', label: 'KAKAOPAY' },
								{ value: 'CARD', label: 'CARD' },
								{ value: 'CASH', label: 'CASH' },
							]}
							aria-label={t('payments.allMethods')}
						/>
						<AdminSelect
							value={typeFilter}
							onChange={(e) => setTypeFilter(e.target.value as PaymentType | '')}
							options={[
								{ value: '', label: t('payments.allTypes') },
								{ value: 'DEPOSIT', label: 'DEPOSIT' },
								{ value: 'FINAL', label: 'FINAL' },
							]}
							aria-label={t('payments.allTypes')}
						/>
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
								<th />
							</tr>
						</thead>
						<tbody>
							{loading && (
								<tr>
									<td colSpan={10} className="fixora-admin-empty">
										{t('common.loading')}
									</td>
								</tr>
							)}
							{!loading && list.length === 0 && (
								<tr>
									<td colSpan={10} className="fixora-admin-empty">
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
									<td>
										{payment.paymentStatus === 'COMPLETED' && (
											<button
												type="button"
												className="fixora-admin-btn fixora-admin-btn--danger-outline fixora-admin-btn--sm"
												onClick={() => handleRefund(payment._id)}
												disabled={refunding}
											>
												{t('payments.actions.refund')}
											</button>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>

					<div className="fixora-admin-table-footer">
						<span>{t('payments.found', { count: total })}</span>
						<AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
					</div>
				</div>
			</div>
		</>
	);
};

export const getServerSideProps = adminPageProps;

export default withAdminLayout(AdminPaymentsPage, { title: 'Payments' });
