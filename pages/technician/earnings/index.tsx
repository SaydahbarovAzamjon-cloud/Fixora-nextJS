import React, { useMemo, useState } from 'react';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery, useReactiveVar } from '@apollo/client';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import AttachMoneyOutlined from '@mui/icons-material/AttachMoneyOutlined';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined';
import ShowChartOutlined from '@mui/icons-material/ShowChartOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import CreditCardOutlined from '@mui/icons-material/CreditCardOutlined';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';
import { GET_MY_BOOKINGS } from '../../../apollo/user/profile';
import { userVar } from '../../../apollo/store';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: { ...(await serverSideTranslations(locale ?? 'en', ['common'])) },
});

const RANGES = ['This Week', 'This Month', 'Last 3 Mo', 'This Year'];

const dailyData = [
	{ day: 'Mon', earned: 330, pending: 100 },
	{ day: 'Tue', earned: 470, pending: 130 },
	{ day: 'Wed', earned: 230, pending: 80 },
	{ day: 'Thu', earned: 620, pending: 200 },
	{ day: 'Fri', earned: 540, pending: 160 },
	{ day: 'Sat', earned: 400, pending: 120 },
	{ day: 'Sun', earned: 160, pending: 60 },
];

const monthlyData = [
	{ month: 'Jan', payout: 7000, color: '#7C6FF0' },
	{ month: 'Feb', payout: 8500, color: '#7C6FF0' },
	{ month: 'Mar', payout: 7000, color: '#7C6FF0' },
	{ month: 'Apr', payout: 11000, color: '#7C6FF0' },
	{ month: 'May', payout: 13600, color: '#FF6B00' },
	{ month: 'Jun', payout: 13000, color: '#3B82F6' },
];

type TxStatus = 'Paid' | 'Pending' | 'Processing';
const TRANSACTIONS: { name: string; ref: string; service: string; amount: number; status: TxStatus }[] = [
	{ name: 'Lily Chen', ref: 'JOB-879', service: 'iPad Pro Screen', amount: 380, status: 'Paid' },
	{ name: 'Tom Harrington', ref: 'JOB-880', service: 'iPhone 13 Battery', amount: 240, status: 'Paid' },
	{ name: 'Anna Schulz', ref: 'JOB-881', service: 'MacBook Logic Board', amount: 680, status: 'Pending' },
	{ name: 'Daniel Wagner', ref: 'JOB-882', service: 'iPhone Water Damage', amount: 320, status: 'Pending' },
	{ name: 'Ryan Park', ref: 'JOB-878', service: 'MacBook Keyboard', amount: 450, status: 'Pending' },
	{ name: 'Sarah Mitchell', ref: 'REQ-1042', service: 'iPhone 15 Screen', amount: 180, status: 'Processing' },
	{ name: 'James Torres', ref: 'REQ-1041', service: 'MacBook Battery', amount: 280, status: 'Paid' },
	{ name: 'Priya Kapoor', ref: 'REQ-1040', service: 'iPad Charging Port', amount: 120, status: 'Paid' },
];

const TX_FILTERS: ('All' | TxStatus)[] = ['All', 'Paid', 'Pending', 'Processing'];

const TX_STATUS_STYLE: Record<TxStatus, { color: string; bg: string }> = {
	Paid: { color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
	Pending: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
	Processing: { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
};

const PAYOUTS = [
	{ amount: '$3,240', acct: 'Chase ••4821 · Jun 14, 2026', dur: '1 day' },
	{ amount: '$2,890', acct: 'Chase ••4821 · Jun 7, 2026', dur: '1 day' },
	{ amount: '$4,120', acct: 'Chase ••4821 · May 31, 2026', dur: '2 days' },
	{ amount: '$3,670', acct: 'Chase ••4821 · May 24, 2026', dur: '1 day' },
];

const DailyTooltip = ({ active, payload, label }: any) => {
	if (!active || !payload?.length) return null;
	const earned = payload.find((p: any) => p.dataKey === 'earned')?.value;
	const pending = payload.find((p: any) => p.dataKey === 'pending')?.value;
	return (
		<div className="fixora-ea-tooltip">
			<div className="fixora-ea-tooltip__title">{label}</div>
			<div className="fixora-ea-tooltip__row" style={{ color: '#FF9A3C' }}>Earned : ${earned}</div>
			<div className="fixora-ea-tooltip__row" style={{ color: '#F59E0B' }}>Pending : ${pending}</div>
		</div>
	);
};

const Earnings: NextPage = () => {
	const user = useReactiveVar(userVar);
	const [range, setRange] = useState('This Week');
	const [txFilter, setTxFilter] = useState<'All' | TxStatus>('All');

	const { data: bookingsData } = useQuery(GET_MY_BOOKINGS, {
		skip: !user?._id,
		variables: { input: { page: 1, limit: 100, search: {} } },
		fetchPolicy: 'network-only',
	});

	const completedJobs = useMemo(
		() => (bookingsData?.getMyBookings?.list ?? []).filter((b: any) => b?.bookingStatus === 'COMPLETED'),
		[bookingsData]
	);

	const totalEarnings = useMemo(
		() => completedJobs.reduce((sum: number, b: any) => sum + (parseFloat(b?.finalPrice) || 0), 0),
		[completedJobs]
	);

	const monthlyEarnings = useMemo(() => {
		const lastMonth = new Date();
		lastMonth.setMonth(lastMonth.getMonth() - 1);
		return completedJobs
			.filter((b: any) => new Date(b?.completedAt || new Date()) > lastMonth)
			.reduce((sum: number, b: any) => sum + (parseFloat(b?.finalPrice) || 0), 0);
	}, [completedJobs]);

	// Use live values when available, otherwise fall back to the design figures.
	const totalEarnedLabel = totalEarnings > 0 ? `$${totalEarnings.toLocaleString()}` : '$3,140';
	const monthLabel = monthlyEarnings > 0 ? `$${monthlyEarnings.toLocaleString()}` : '$11,200';

	const filteredTx = useMemo(
		() => (txFilter === 'All' ? TRANSACTIONS : TRANSACTIONS.filter((t) => t.status === txFilter)),
		[txFilter]
	);

	const stats = [
		{ label: 'Total Earned', value: totalEarnedLabel, sub: '+18% vs last week', subColor: '#22C55E', icon: <AttachMoneyOutlined style={{ fontSize: 20, color: '#FF6B00' }} />, bg: 'rgba(255,107,0,0.12)' },
		{ label: 'Pending', value: '$650', sub: '5 jobs awaiting payment', subColor: '#F59E0B', icon: <AccessTimeOutlined style={{ fontSize: 19, color: '#F59E0B' }} />, bg: 'rgba(245,158,11,0.12)' },
		{ label: 'Next Payout', value: '$1,630', sub: 'Est. Jun 21, 2026', subColor: '#808080', icon: <AccountBalanceWalletOutlined style={{ fontSize: 19, color: '#22C55E' }} />, bg: 'rgba(34,197,94,0.12)' },
		{ label: 'This Month', value: monthLabel, sub: '+22% vs May', subColor: '#22C55E', icon: <ShowChartOutlined style={{ fontSize: 19, color: '#3B82F6' }} />, bg: 'rgba(59,130,246,0.12)' },
	];

	return (
		<div className="fixora-ea-page">
			{/* Header */}
			<div className="fixora-ea-header">
				<div>
					<h1 className="fixora-ea-header__title">Earnings &amp; Payouts</h1>
					<p className="fixora-ea-header__sub">Track income, pending payments and payout history</p>
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
								{r}
							</button>
						))}
					</div>
					<button className="fixora-ea-payout-btn" type="button">
						<FileDownloadOutlined style={{ fontSize: 18 }} /> Request Payout
					</button>
				</div>
			</div>

			{/* Stat cards */}
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

			{/* Charts row */}
			<div className="fixora-ea-row fixora-ea-row--2-1">
				<div className="fixora-ea-card">
					<div className="fixora-ea-card__head">
						<h2 className="fixora-ea-card__title">Daily Earnings</h2>
						<div className="fixora-ea-legend">
							<span className="fixora-ea-legend__item"><span className="fixora-ea-legend__dot" style={{ background: '#FF6B00' }} /> Earned</span>
							<span className="fixora-ea-legend__item"><span className="fixora-ea-legend__dot" style={{ background: '#F59E0B' }} /> Pending</span>
						</div>
					</div>
					<div className="fixora-ea-bignum">
						<span className="fixora-ea-bignum__val">$3,140</span>
						<span className="fixora-ea-bignum__delta"><TrendingUpOutlined style={{ fontSize: 14 }} /> +18% vs last week</span>
					</div>
					<div className="fixora-ea-chart">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={dailyData} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
								<defs>
									<linearGradient id="eaEarned" x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%" stopColor="#FF9A3C" stopOpacity={0.3} />
										<stop offset="100%" stopColor="#FF6B00" stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
								<XAxis dataKey="day" stroke="#5A5A5A" tick={{ fontSize: 12, fill: '#808080' }} axisLine={false} tickLine={false} />
								<YAxis stroke="#5A5A5A" tick={{ fontSize: 12, fill: '#707070' }} axisLine={false} tickLine={false} domain={[0, 800]} ticks={[0, 200, 400, 600, 800]} tickFormatter={(v) => `$${v}`} />
								<Tooltip content={<DailyTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.15)' }} />
								<Area type="monotone" dataKey="pending" stroke="#F59E0B" strokeWidth={1} fillOpacity={0} dot={false} />
								<Area type="monotone" dataKey="earned" stroke="#FF6B00" strokeWidth={2.5} fill="url(#eaEarned)" dot={false} activeDot={{ r: 5, fill: '#FF6B00' }} />
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</div>

				<div className="fixora-ea-card">
					<div className="fixora-ea-card__head">
						<h2 className="fixora-ea-card__title">Monthly Payouts</h2>
					</div>
					<div className="fixora-ea-bignum">
						<span className="fixora-ea-bignum__val fixora-ea-bignum__val--blue">$60,100</span>
					</div>
					<div className="fixora-ea-subnote">Jan — Jun 2026</div>
					<div className="fixora-ea-chart">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={monthlyData} margin={{ top: 10, right: 8, left: -8, bottom: 0 }} barCategoryGap="30%">
								<CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
								<XAxis dataKey="month" stroke="#5A5A5A" tick={{ fontSize: 12, fill: '#808080' }} axisLine={false} tickLine={false} />
								<YAxis stroke="#5A5A5A" tick={{ fontSize: 11, fill: '#707070' }} axisLine={false} tickLine={false} domain={[0, 14000]} ticks={[0, 4000, 7000, 11000, 14000]} tickFormatter={(v) => `$${v / 1000}k`} />
								<Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} contentStyle={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} formatter={(v: any) => [`$${v.toLocaleString()}`, 'Payout']} />
								<Bar dataKey="payout" radius={[6, 6, 0, 0]} maxBarSize={42}>
									{monthlyData.map((d) => (
										<Cell key={d.month} fill={d.color} />
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>

			{/* Transactions + payout history */}
			<div className="fixora-ea-row fixora-ea-row--2-1">
				<div className="fixora-ea-card">
					<div className="fixora-ea-card__head">
						<h2 className="fixora-ea-card__title">Transactions</h2>
						<div className="fixora-ea-txfilters">
							{TX_FILTERS.map((f) => (
								<button
									key={f}
									className={`fixora-ea-txfilter ${txFilter === f ? 'fixora-ea-txfilter--active' : ''}`}
									onClick={() => setTxFilter(f)}
									type="button"
								>
									{f}
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
										<div className="fixora-ea-tx__amount">${tx.amount}</div>
										<span className="fixora-ea-tx__status" style={{ color: st.color, background: st.bg }}>{tx.status}</span>
									</div>
								</div>
							);
						})}
					</div>
				</div>

				<div className="fixora-ea-card">
					<div className="fixora-ea-card__head">
						<h2 className="fixora-ea-card__title">Payout History</h2>
						<button className="fixora-ea-seeall" type="button">See all</button>
					</div>

					<div className="fixora-ea-balance">
						<div className="fixora-ea-balance__label">Available Balance</div>
						<div className="fixora-ea-balance__value">$1,630</div>
						<div className="fixora-ea-balance__note">Next auto-payout: Jun 21</div>
						<button className="fixora-ea-balance__btn" type="button">
							<FileDownloadOutlined style={{ fontSize: 17 }} /> Withdraw Now
						</button>
					</div>

					<div className="fixora-ea-payouts">
						{PAYOUTS.map((p, i) => (
							<div key={i} className="fixora-ea-payout">
								<div className="fixora-ea-payout__icon">
									<CheckCircleOutline style={{ fontSize: 18, color: '#22C55E' }} />
								</div>
								<div className="fixora-ea-payout__info">
									<div className="fixora-ea-payout__amount">{p.amount}</div>
									<div className="fixora-ea-payout__acct">{p.acct}</div>
								</div>
								<div className="fixora-ea-payout__right">
									<div className="fixora-ea-payout__status">Completed</div>
									<div className="fixora-ea-payout__dur">{p.dur}</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default withTechnicianLayout(Earnings);
