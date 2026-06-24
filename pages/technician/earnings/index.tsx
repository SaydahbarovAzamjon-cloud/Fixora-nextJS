import React, { useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { technicianPageProps } from '../../../libs/i18n/technicianPageProps';
import { AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import AttachMoneyOutlined from '@mui/icons-material/AttachMoneyOutlined';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined';
import ShowChartOutlined from '@mui/icons-material/ShowChartOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import CreditCardOutlined from '@mui/icons-material/CreditCardOutlined';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';
import { useFixoraChartTheme } from '../../../libs/hooks/useFixoraChartTheme';
import { fixoraRechartsTooltipProps } from '../../../libs/utils/fixoraRecharts';
import { GET_MY_PAYMENTS, GET_TECHNICIAN_BOOKINGS } from '../../../apollo/user/profile';
import { GET_MY_PAYOUTS, GET_WALLET_BALANCE, REQUEST_PAYOUT } from '../../../apollo/user/payout';
import { userVar } from '../../../apollo/store';
import { buildKrwTicks, formatKrw, formatKrwCompact } from '../../../libs/utils/formatCurrency';
import {
	buildDailyEarningsSeriesWithPayments,
	buildMonthlyPayouts,
	buildMonthlyPayoutsFromRecords,
	buildTransactions,
	EarningsRange,
	hasRealBookings,
	hasRealPayments,
	percentChange,
	sumCompletedEarnings,
	sumCompletedPaymentEarnings,
	sumPendingAmount,
	sumThisMonthEarnings,
	sumThisMonthPaymentEarnings,
	TxStatus,
	withFallback,
} from '../../../libs/utils/technicianMetrics';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../../libs/sweetAlert';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: await technicianPageProps(locale),
});

const RANGE_KEYS: Record<EarningsRange, string> = {
	'This Week': 'earnings.rangeThisWeek',
	'This Month': 'earnings.rangeThisMonth',
	'Last 3 Mo': 'earnings.rangeLast3Mo',
	'This Year': 'earnings.rangeThisYear',
};

const TX_FILTER_KEYS: Record<'All' | TxStatus, string> = {
	All: 'earnings.filterAll',
	Paid: 'earnings.statusPaid',
	Pending: 'earnings.statusPending',
	Processing: 'earnings.statusProcessing',
};

const DEMO_DAILY = [
	{ day: 'Mon', earned: 440000, pending: 133000 },
	{ day: 'Tue', earned: 627000, pending: 173000 },
	{ day: 'Wed', earned: 307000, pending: 107000 },
	{ day: 'Thu', earned: 827000, pending: 267000 },
	{ day: 'Fri', earned: 720000, pending: 213000 },
	{ day: 'Sat', earned: 533000, pending: 160000 },
	{ day: 'Sun', earned: 213000, pending: 80000 },
];

const DEMO_MONTHLY = [
	{ month: 'Jan', payout: 9330000, color: '#7C6FF0' },
	{ month: 'Feb', payout: 11330000, color: '#7C6FF0' },
	{ month: 'Mar', payout: 9330000, color: '#7C6FF0' },
	{ month: 'Apr', payout: 14670000, color: '#7C6FF0' },
	{ month: 'May', payout: 18130000, color: '#8e1428' },
	{ month: 'Jun', payout: 17330000, color: '#3B82F6' },
];

const DEMO_TRANSACTIONS = [
	{ name: 'Lily Chen', ref: 'JOB-879', service: 'iPad Pro Screen', amount: 507000, status: 'Paid' as TxStatus },
	{ name: 'Tom Harrington', ref: 'JOB-880', service: 'iPhone 13 Battery', amount: 320000, status: 'Paid' as TxStatus },
	{ name: 'Anna Schulz', ref: 'JOB-881', service: 'MacBook Logic Board', amount: 907000, status: 'Pending' as TxStatus },
	{ name: 'Daniel Wagner', ref: 'JOB-882', service: 'iPhone Water Damage', amount: 427000, status: 'Pending' as TxStatus },
	{ name: 'Ryan Park', ref: 'JOB-878', service: 'MacBook Keyboard', amount: 600000, status: 'Pending' as TxStatus },
	{ name: 'Sarah Mitchell', ref: 'REQ-1042', service: 'iPhone 15 Screen', amount: 240000, status: 'Processing' as TxStatus },
	{ name: 'James Torres', ref: 'REQ-1041', service: 'MacBook Battery', amount: 373000, status: 'Paid' as TxStatus },
	{ name: 'Priya Kapoor', ref: 'REQ-1040', service: 'iPad Charging Port', amount: 160000, status: 'Paid' as TxStatus },
];

const TX_FILTERS: ('All' | TxStatus)[] = ['All', 'Paid', 'Pending', 'Processing'];

const TX_STATUS_STYLE: Record<TxStatus, { color: string; bg: string }> = {
	Paid: { color: '#BBF7D0', bg: 'rgba(34, 197, 94, 0.22)' },
	Pending: { color: '#FDE68A', bg: 'rgba(245, 158, 11, 0.22)' },
	Processing: { color: '#BFDBFE', bg: 'rgba(59, 130, 246, 0.28)' },
};

const RANGES: EarningsRange[] = ['This Week', 'This Month', 'Last 3 Mo', 'This Year'];

const DailyTooltip = ({ active, payload, label, t, chart }: any) => {
	if (!active || !payload?.length) return null;
	const earned = payload.find((p: any) => p.dataKey === 'earned')?.value;
	const pending = payload.find((p: any) => p.dataKey === 'pending')?.value;
	return (
		<div className="fixora-ea-tooltip">
			<div className="fixora-ea-tooltip__title">{label}</div>
			<div className="fixora-ea-tooltip__row" style={{ color: chart.primaryHover }}>{t('earnings.earned')} : {formatKrw(earned ?? 0)}</div>
			<div className="fixora-ea-tooltip__row" style={{ color: chart.starActive }}>{t('earnings.pending')} : {formatKrw(pending ?? 0)}</div>
		</div>
	);
};

const Earnings: NextPage = () => {
	const { t } = useTranslation('technician');
	const chart = useFixoraChartTheme();
	const barTooltipProps = fixoraRechartsTooltipProps(chart);
	const user = useReactiveVar(userVar);
	const [range, setRange] = useState<EarningsRange>('This Week');
	const [txFilter, setTxFilter] = useState<'All' | TxStatus>('All');

	const { data: bookingsData } = useQuery(GET_TECHNICIAN_BOOKINGS, {
		skip: !user?._id,
		variables: { input: { page: 1, limit: 200, search: {} } },
		fetchPolicy: 'network-only',
	});

	const { data: paymentsData, refetch: refetchPayments } = useQuery(GET_MY_PAYMENTS, {
		skip: !user?._id,
		variables: { input: { page: 1, limit: 200, search: {} } },
		fetchPolicy: 'network-only',
	});

	const { data: walletData, refetch: refetchWallet } = useQuery(GET_WALLET_BALANCE, {
		skip: !user?._id,
		fetchPolicy: 'network-only',
	});

	const { data: payoutsData, refetch: refetchPayouts } = useQuery(GET_MY_PAYOUTS, {
		skip: !user?._id,
		variables: { input: { page: 1, limit: 20, search: {} } },
		fetchPolicy: 'network-only',
	});

	const [requestPayout, { loading: requestingPayout }] = useMutation(REQUEST_PAYOUT);

	const wallet = walletData?.getWalletBalance;
	const payoutList = useMemo(() => payoutsData?.getMyPayouts?.list ?? [], [payoutsData]);

	const bookings = useMemo(() => bookingsData?.getTechnicianBookings?.list ?? [], [bookingsData]);
	const payments = useMemo(() => paymentsData?.getMyPayments?.list ?? [], [paymentsData]);
	const useReal = hasRealBookings(bookings) || hasRealPayments(payments) || !!wallet;

	const totalEarnings = useMemo(() => {
		if (wallet?.totalEarned != null) return wallet.totalEarned;
		if (hasRealPayments(payments)) return sumCompletedPaymentEarnings(payments);
		return sumCompletedEarnings(bookings);
	}, [bookings, payments, wallet]);
	const monthlyEarnings = useMemo(() => {
		if (hasRealPayments(payments)) return sumThisMonthPaymentEarnings(payments);
		return sumThisMonthEarnings(bookings);
	}, [bookings, payments]);
	const pendingAmount = useMemo(() => {
		if (wallet?.pendingBalance != null) return wallet.pendingBalance;
		return sumPendingAmount(bookings, payments);
	}, [bookings, payments, wallet]);

	const dailySeries = useMemo(() => {
		const real = buildDailyEarningsSeriesWithPayments(bookings, payments, range);
		return withFallback(real, DEMO_DAILY, useReal);
	}, [bookings, payments, range, useReal]);

	const monthlySeries = useMemo(() => {
		const fromPayouts = buildMonthlyPayoutsFromRecords(payoutList);
		if (fromPayouts.length > 0) return fromPayouts;
		const real = buildMonthlyPayouts(bookings, payments);
		return withFallback(real.length > 0 ? real : [], DEMO_MONTHLY, useReal && real.length > 0);
	}, [bookings, payments, payoutList, useReal]);

	const transactions = useMemo(() => {
		const real = buildTransactions(bookings, payments);
		return withFallback(real, DEMO_TRANSACTIONS, useReal && real.length > 0);
	}, [bookings, payments, useReal]);

	const periodEarned = useMemo(() => dailySeries.reduce((s, d) => s + d.earned, 0), [dailySeries]);
	const monthlyTotal = useMemo(() => monthlySeries.reduce((s, d) => s + d.payout, 0), [monthlySeries]);

	const pendingJobsCount = useMemo(
		() => bookings.filter((b: any) => ['ACCEPTED', 'IN_PROGRESS'].includes(b?.bookingStatus)).length,
		[bookings],
	);

	const weekChange = useMemo(() => {
		if (!useReal) return '+18% vs last week';
		const prevStart = new Date();
		prevStart.setDate(prevStart.getDate() - 14);
		const prevEnd = new Date();
		prevEnd.setDate(prevEnd.getDate() - 7);
		const prev = bookings
			.filter((b: any) => b.bookingStatus === 'COMPLETED')
			.filter((b: any) => {
				const when = new Date(b.completedAt || b.createdAt);
				return when >= prevStart && when < prevEnd;
			})
			.reduce((s: number, b: any) => s + (parseFloat(b.finalPrice) || 0), 0);
		const pct = percentChange(periodEarned, prev);
		return pct ? `${pct} vs last week` : '+18% vs last week';
	}, [bookings, periodEarned, useReal]);

	const totalEarnedLabel = formatKrw(totalEarnings);
	const monthLabel = formatKrw(monthlyEarnings);
	const pendingLabel = formatKrw(pendingAmount);
	const periodTotalLabel = periodEarned > 0 ? formatKrw(periodEarned) : formatKrw(0);
	const monthlyTotalLabel = monthlyTotal > 0 ? formatKrw(monthlyTotal) : formatKrw(0);
	const availableBalance = wallet?.availableBalance ?? 0;
	const nextPayoutDate = wallet?.nextPayoutAt
		? new Date(wallet.nextPayoutAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
		: '—';

	const chartMax = Math.max(100000, ...dailySeries.flatMap((d) => [d.earned, d.pending]));
	const chartTicks = buildKrwTicks(chartMax, 4);
	const payoutMax = Math.max(100000, ...monthlySeries.map((d) => d.payout));
	const payoutTicks = buildKrwTicks(payoutMax, 4);

	const filteredTx = useMemo(
		() => (txFilter === 'All' ? transactions : transactions.filter((t) => t.status === txFilter)),
		[transactions, txFilter],
	);

	const stats = [
		{ label: t('earnings.totalEarned'), value: totalEarnedLabel, sub: weekChange, subColor: '#22C55E', icon: <AttachMoneyOutlined style={{ fontSize: 20, color: chart.primary }} />, bg: 'var(--fixora-primary-soft-bg)' },
		{
			label: t('earnings.pending'),
			value: pendingLabel,
			sub: useReal && pendingJobsCount > 0 ? t('earnings.jobsAwaiting', { count: pendingJobsCount }) : t('earnings.jobsAwaitingDemo'),
			subColor: '#F59E0B',
			icon: <AccessTimeOutlined style={{ fontSize: 19, color: '#F59E0B' }} />,
			bg: 'rgba(245,158,11,0.12)',
		},
		{ label: t('earnings.nextPayout'), value: formatKrw(wallet?.estimatedAmount ?? 0), sub: nextPayoutDate, subColor: '#808080', icon: <AccountBalanceWalletOutlined style={{ fontSize: 19, color: '#22C55E' }} />, bg: 'rgba(34,197,94,0.12)' },
		{ label: t('earnings.thisMonth'), value: monthLabel, sub: '+22% vs May', subColor: '#22C55E', icon: <ShowChartOutlined style={{ fontSize: 19, color: '#3B82F6' }} />, bg: 'rgba(59,130,246,0.12)' },
	];

	const monthNote = useMemo(() => {
		const year = new Date().getFullYear();
		if (monthlySeries.length === 0) return `Jan — Jun ${year}`;
		return `${monthlySeries[0]?.month} — ${monthlySeries[monthlySeries.length - 1]?.month} ${year}`;
	}, [monthlySeries]);

	const handlePayoutAction = async () => {
		try {
			await requestPayout({
				variables: { input: { payoutMethod: 'KAKAOPAY', accountLabel: 'KakaoPay' } },
			});
			await sweetTopSmallSuccessAlert(t('earnings.payoutRequested'), 1200);
			await Promise.all([refetchWallet(), refetchPayouts(), refetchPayments()]);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	return (
		<div className="fixora-ea-page">
			<div className="fixora-ea-header">
				<div>
					<h1 className="fixora-ea-header__title">{t('earnings.title')}</h1>
					<p className="fixora-ea-header__sub">{t('earnings.subtitle')}</p>
				</div>
				<div className="fixora-ea-header__right">
					<div className="fixora-ea-range">
						{RANGES.map((r) => (
							<button
								key={r}
								className={`fixora-ea-range__btn ${range === r ? 'fixora-ea-range__btn--active' : ''}`}
								onClick={() => setRange(r)}
								type="button"
							>
								{t(RANGE_KEYS[r])}
							</button>
						))}
					</div>
					<button className="fixora-ea-payout-btn" type="button" onClick={handlePayoutAction} disabled={requestingPayout}>
						<FileDownloadOutlined style={{ fontSize: 18 }} /> {t('earnings.requestPayout')}
					</button>
				</div>
			</div>

			<div className="fixora-ea-stats">
				{stats.map((s) => (
					<div key={s.label} className="fixora-ea-stat">
						<div className="fixora-ea-stat__top">
							<div className="fixora-ea-stat__label">{s.label}</div>
							<div className="fixora-ea-stat__icon" style={{ background: s.bg }}>{s.icon}</div>
						</div>
						<div className="fixora-ea-stat__value">{s.value}</div>
						<div className="fixora-ea-stat__sub" style={{ color: s.subColor }}>{s.sub}</div>
					</div>
				))}
			</div>

			<div className="fixora-ea-row fixora-ea-row--2-1">
				<div className="fixora-ea-card">
					<div className="fixora-ea-card__head">
						<h2 className="fixora-ea-card__title">{t('earnings.dailyEarnings')}</h2>
						<div className="fixora-ea-legend">
							<span className="fixora-ea-legend__item"><span className="fixora-ea-legend__dot" style={{ background: chart.primary }} /> {t('earnings.earned')}</span>
							<span className="fixora-ea-legend__item"><span className="fixora-ea-legend__dot" style={{ background: chart.starActive }} /> {t('earnings.pending')}</span>
						</div>
					</div>
					<div className="fixora-ea-bignum">
						<span className="fixora-ea-bignum__val">{periodTotalLabel}</span>
						<span className="fixora-ea-bignum__delta"><TrendingUpOutlined style={{ fontSize: 14 }} /> {weekChange}</span>
					</div>
					<div className="fixora-ea-chart">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={dailySeries} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
								<defs>
									<linearGradient id="eaEarned" x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%" stopColor={chart.primaryHover} stopOpacity={0.3} />
										<stop offset="100%" stopColor={chart.primary} stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray="4 4" stroke={chart.grid} vertical={false} />
								<XAxis dataKey="day" stroke={chart.axisMuted} tick={{ fontSize: 12, fill: chart.axis }} axisLine={false} tickLine={false} />
								<YAxis stroke={chart.axisMuted} tick={{ fontSize: 12, fill: chart.axisMuted }} axisLine={false} tickLine={false} domain={[0, chartTicks[chartTicks.length - 1]]} ticks={chartTicks} tickFormatter={(v) => formatKrwCompact(v)} />
								<Tooltip content={<DailyTooltip t={t} chart={chart} />} cursor={{ stroke: chart.tooltipCursor }} />
								<Area type="monotone" dataKey="pending" stroke={chart.starActive} strokeWidth={1} fillOpacity={0} dot={false} />
								<Area type="monotone" dataKey="earned" stroke={chart.primary} strokeWidth={2.5} fill="url(#eaEarned)" dot={false} activeDot={{ r: 5, fill: chart.primary }} />
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</div>

				<div className="fixora-ea-card">
					<div className="fixora-ea-card__head">
						<h2 className="fixora-ea-card__title">{t('earnings.monthlyPayouts')}</h2>
					</div>
					<div className="fixora-ea-bignum">
						<span className="fixora-ea-bignum__val fixora-ea-bignum__val--blue">{monthlyTotalLabel}</span>
					</div>
					<div className="fixora-ea-subnote">{monthNote}</div>
					<div className="fixora-ea-chart">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={monthlySeries} margin={{ top: 10, right: 8, left: -8, bottom: 0 }} barCategoryGap="30%">
								<CartesianGrid strokeDasharray="4 4" stroke={chart.grid} vertical={false} />
								<XAxis dataKey="month" stroke={chart.axisMuted} tick={{ fontSize: 12, fill: chart.axis }} axisLine={false} tickLine={false} />
								<YAxis stroke={chart.axisMuted} tick={{ fontSize: 11, fill: chart.axisMuted }} axisLine={false} tickLine={false} domain={[0, payoutTicks[payoutTicks.length - 1]]} ticks={payoutTicks} tickFormatter={(v) => formatKrwCompact(v)} />
								<Tooltip {...barTooltipProps} formatter={(v: any) => [formatKrw(v), t('earnings.payout')]} />
								<Bar dataKey="payout" radius={[6, 6, 0, 0]} maxBarSize={42}>
									{monthlySeries.map((d) => (
										<Cell key={d.month} fill={d.color} />
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>

			<div className="fixora-ea-row fixora-ea-row--2-1">
				<div className="fixora-ea-card">
					<div className="fixora-ea-card__head">
						<h2 className="fixora-ea-card__title">{t('earnings.transactions')}</h2>
						<div className="fixora-ea-txfilters">
							{TX_FILTERS.map((f) => (
								<button
									key={f}
									className={`fixora-ea-txfilter ${txFilter === f ? 'fixora-ea-txfilter--active' : ''}`}
									onClick={() => setTxFilter(f)}
									type="button"
								>
									{t(TX_FILTER_KEYS[f])}
								</button>
							))}
						</div>
					</div>
					<div className="fixora-ea-txlist">
						{filteredTx.map((tx) => {
							const st = TX_STATUS_STYLE[tx.status];
							return (
								<div key={tx.ref} className="fixora-ea-tx">
									<div className="fixora-ea-tx__icon">
										<CreditCardOutlined style={{ fontSize: 18, color: '#909090' }} />
									</div>
									<div className="fixora-ea-tx__info">
										<div className="fixora-ea-tx__name">{tx.name}</div>
										<div className="fixora-ea-tx__service">{tx.ref} — {tx.service}</div>
									</div>
									<div className="fixora-ea-tx__right">
										<div className="fixora-ea-tx__amount">{formatKrw(tx.amount)}</div>
										<span className="fixora-ea-tx__status" style={{ color: st.color, background: st.bg }}>{t(TX_FILTER_KEYS[tx.status])}</span>
									</div>
								</div>
							);
						})}
					</div>
				</div>

				<div className="fixora-ea-card">
					<div className="fixora-ea-card__head">
						<h2 className="fixora-ea-card__title">{t('earnings.payoutHistory')}</h2>
						<button className="fixora-ea-seeall" type="button">{t('earnings.seeAll')}</button>
					</div>

					<div className="fixora-ea-balance">
						<div className="fixora-ea-balance__label">{t('earnings.availableBalance')}</div>
						<div className="fixora-ea-balance__value">{formatKrw(availableBalance)}</div>
						<div className="fixora-ea-balance__note">{t('earnings.nextAutoPayout')} {nextPayoutDate}</div>
						<button className="fixora-ea-balance__btn" type="button" onClick={handlePayoutAction} disabled={requestingPayout || availableBalance <= 0}>
							<FileDownloadOutlined style={{ fontSize: 17 }} /> {t('earnings.withdrawNow')}
						</button>
					</div>

					<div className="fixora-ea-payouts">
						{payoutList.length === 0 && (
							<div className="fixora-ea-payout__info" style={{ padding: '12px 0', color: '#808080' }}>
								{t('earnings.noPayoutHistory')}
							</div>
						)}
						{payoutList.map((p: { _id: string; payoutAmount: number; accountLabel?: string; completedAt?: string; requestedAt?: string; payoutStatus: string }) => {
							const when = p.completedAt || p.requestedAt;
							const acct = p.accountLabel || 'KakaoPay';
							const dateLabel = when
								? new Date(when).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
								: '';
							return (
								<div key={p._id} className="fixora-ea-payout">
									<div className="fixora-ea-payout__icon">
										<CheckCircleOutline style={{ fontSize: 18, color: '#22C55E' }} />
									</div>
									<div className="fixora-ea-payout__info">
										<div className="fixora-ea-payout__amount">{formatKrw(p.payoutAmount)}</div>
										<div className="fixora-ea-payout__acct">{acct}{dateLabel ? ` · ${dateLabel}` : ''}</div>
									</div>
									<div className="fixora-ea-payout__right">
										<div className="fixora-ea-payout__status">{p.payoutStatus}</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
};

export default withTechnicianLayout(Earnings);
