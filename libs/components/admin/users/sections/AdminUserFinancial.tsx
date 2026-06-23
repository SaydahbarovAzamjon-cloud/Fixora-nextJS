import React from 'react';
import { useTranslation } from 'next-i18next';
import { formatKrw } from '../../../../utils/formatCurrency';

interface PaymentRow {
	_id: string;
	paymentAmount: number;
	paymentType: string;
	paymentStatus: string;
	paymentMethod: string;
	createdAt: string;
	bookingId?: string;
}

interface Props {
	payments: PaymentRow[];
	loading?: boolean;
}

const AdminUserFinancial: React.FC<Props> = ({ payments, loading }) => {
	const { t } = useTranslation('admin');

	const completed = payments.filter((p) => p.paymentStatus === 'COMPLETED' || p.paymentStatus === 'PAID');
	const deposits = completed.filter((p) => p.paymentType === 'DEPOSIT');
	const finals = completed.filter((p) => p.paymentType === 'FINAL');
	const refunds = payments.filter((p) => p.paymentStatus === 'REFUNDED');

	const sum = (rows: PaymentRow[]) => rows.reduce((acc, p) => acc + (p.paymentAmount || 0), 0);

	return (
		<section id="financial" className="fixora-admin-user-section">
			<h3 className="fixora-admin-user-section__title">{t('userDetail.sections.financial')}</h3>
			{loading && <p className="fixora-admin-muted">{t('common.loading')}</p>}
			<div className="fixora-admin-stat-grid">
				<div className="fixora-admin-stat-grid__item">
					<span className="fixora-admin-stat-grid__label">{t('userDetail.financial.totalRevenue')}</span>
					<strong>{formatKrw(sum(completed))}</strong>
				</div>
				<div className="fixora-admin-stat-grid__item">
					<span className="fixora-admin-stat-grid__label">{t('userDetail.financial.deposits')}</span>
					<strong>{formatKrw(sum(deposits))}</strong>
				</div>
				<div className="fixora-admin-stat-grid__item">
					<span className="fixora-admin-stat-grid__label">{t('userDetail.financial.finals')}</span>
					<strong>{formatKrw(sum(finals))}</strong>
				</div>
				<div className="fixora-admin-stat-grid__item">
					<span className="fixora-admin-stat-grid__label">{t('userDetail.financial.refunds')}</span>
					<strong>{formatKrw(sum(refunds))}</strong>
				</div>
			</div>

			<h4 className="fixora-admin-user-section__subtitle">{t('userDetail.financial.transactions')}</h4>
			{payments.length === 0 ? (
				<p className="fixora-admin-muted">{t('userDetail.financial.empty')}</p>
			) : (
				<div className="fixora-admin-table-wrap fixora-admin-table-wrap--nested">
					<table className="fixora-admin-table">
						<thead>
							<tr>
								<th>{t('payments.columns.paymentId')}</th>
								<th>{t('payments.columns.type')}</th>
								<th>{t('payments.columns.amount')}</th>
								<th>{t('payments.columns.status')}</th>
								<th>{t('payments.columns.date')}</th>
							</tr>
						</thead>
						<tbody>
							{payments.map((p) => (
								<tr key={p._id}>
									<td>{p._id.slice(-8)}</td>
									<td>{p.paymentType}</td>
									<td>{formatKrw(p.paymentAmount)}</td>
									<td>{p.paymentStatus}</td>
									<td>{new Date(p.createdAt).toLocaleDateString()}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</section>
	);
};

export default AdminUserFinancial;
