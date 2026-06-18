import React, { useMemo, useState } from 'react';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useQuery, useReactiveVar } from '@apollo/client';
import {
	ComposedChart,
	Area,
	Line,
	BarChart,
	Bar,
	AreaChart,
	PieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from 'recharts';
import WorkOutlineOutlined from '@mui/icons-material/WorkOutlineOutlined';
import BoltOutlined from '@mui/icons-material/BoltOutlined';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import GroupOutlined from '@mui/icons-material/GroupOutlined';
import StarBorderOutlined from '@mui/icons-material/StarBorderOutlined';
import EmojiEventsOutlined from '@mui/icons-material/EmojiEventsOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import StarRounded from '@mui/icons-material/StarRounded';
import withTechnicianLayout from '../../../libs/components/layout/TechnicianLayout';
import { GET_TECHNICIAN_BOOKINGS } from '../../../apollo/user/profile';
import { GET_TECHNICIAN_REVIEWS, GET_USER } from '../../../apollo/user/query';
import { userVar } from '../../../apollo/store';
import { buildKrwTicks, formatKrw, formatKrwCompact } from '../../../libs/utils/formatCurrency';
import {
	AnalyticsRange,
	buildDeviceBreakdown,
	buildIssueRevenue,
	buildRatingTrend,
	buildRevenueJobsSeries,
	buildTopClients,
	computeCompletionRate,
	computeRepeatClientRate,
	getCompletedBookings,
	hasRealBookings,
	withFallback,
} from '../../../libs/utils/technicianMetrics';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: { ...(await serverSideTranslations(locale ?? 'en', ['common'])) },
});

const RANGES: AnalyticsRange[] = ['7 Days', '30 Days', '3 Months', 'Year'];

const DEMO_REVENUE = [
	{ day: 'Mon', revenue: 560000, jobs: 3 },
	{ day: 'Tue', revenue: 907000, jobs: 4 },
	{ day: 'Wed', revenue: 320000, jobs: 2 },
	{ day: 'Thu', revenue: 1307000, jobs: 7 },
	{ day: 'Fri', revenue: 1534000, jobs: 8 },
	{ day: 'Sat', revenue: 933000, jobs: 5 },
	{ day: 'Sun', revenue: 400000, jobs: 2 },
];

const DEMO_DEVICES = [
	{ name: 'iPhone', value: 54, color: '#FF6B00' },
	{ name: 'MacBook', value: 28, color: '#3B82F6' },
	{ name: 'iPad', value: 12, color: '#22C55E' },
	{ name: 'Apple Watch', value: 6, color: '#A855F7' },
];

const DEMO_REPAIR_TYPES = [
	{ type: 'Screen', revenue: 8266000, color: '#FF6B00' },
	{ type: 'Battery', revenue: 3601000, color: '#FBBF77' },
	{ type: 'Water', revenue: 5602000, color: '#3B82F6' },
	{ type: 'Camera', revenue: 3734000, color: '#22C55E' },
	{ type: 'Logic', revenue: 7202000, color: '#A855F7' },
	{ type: 'Charging', revenue: 2001000, color: '#F5C518' },
];

const DEMO_RATING = [
	{ week: 'W1', rating: 4.65 },
	{ week: 'W2', rating: 4.7 },
	{ week: 'W3', rating: 4.78 },
	{ week: 'W4', rating: 4.82 },
	{ week: 'W5', rating: 4.85 },
	{ week: 'W6', rating: 4.95 },
	{ week: 'W7', rating: 4.9 },
];

const DEMO_CLIENTS = [
	{ name: 'Sarah', initial: 'S', stars: 5, amount: '₩853,000', jobs: '4 jobs' },
	{ name: 'Daniel', initial: 'D', stars: 5, amount: '₩1,187,000', jobs: '3 jobs' },
	{ name: 'James', initial: 'J', stars: 5, amount: '₩960,000', jobs: '3 jobs' },
	{ name: 'Lily', initial: 'L', stars: 4, amount: '₩1,013,000', jobs: '2 jobs' },
	{ name: 'Anna', initial: 'A', stars: 5, amount: '₩1,813,000', jobs: '2 jobs' },
];

const RevenueTooltip = ({ active, payload, label }: any) => {
	if (!active || !payload?.length) return null;
	const rev = payload.find((p: any) => p.dataKey === 'revenue')?.value;
	const jobs = payload.find((p: any) => p.dataKey === 'jobs')?.value;
	return (
		<div className="fixora-an-tooltip">
			<div className="fixora-an-tooltip__title">{label}</div>
			<div className="fixora-an-tooltip__row" style={{ color: '#FF9A3C' }}>Revenue : {formatKrw(rev ?? 0)}</div>
			<div className="fixora-an-tooltip__row" style={{ color: '#3B82F6' }}>Jobs : {jobs}</div>
		</div>
	);
};

const Analytics: NextPage = () => {
	const user = useReactiveVar(userVar);
	const [range, setRange] = useState<AnalyticsRange>('7 Days');

	const { data: bookingsData } = useQuery(GET_TECHNICIAN_BOOKINGS, {
		skip: !user?._id,
		variables: { input: { page: 1, limit: 200, search: {} } },
		fetchPolicy: 'network-only',
	});

	const { data: userData } = useQuery(GET_USER, {
		skip: !user?._id,
		variables: { userId: user?._id },
		fetchPolicy: 'network-only',
	});

	const { data: reviewsData } = useQuery(GET_TECHNICIAN_REVIEWS, {
		skip: !user?._id,
		variables: {
			input: {
				page: 1,
				limit: 100,
				sort: 'createdAt',
				direction: 'DESC',
				search: { technicianId: user?._id ?? '' },
			},
		},
		fetchPolicy: 'network-only',
	});

	const bookings = useMemo(() => bookingsData?.getTechnicianBookings?.list ?? [], [bookingsData]);
	const reviews = useMemo(() => reviewsData?.getTechnicianReviews?.list ?? [], [reviewsData]);
	const technicianUser = userData?.getUser;
	const useReal = hasRealBookings(bookings);

	const revenueSeries = useMemo(() => {
		const real = buildRevenueJobsSeries(bookings, range);
		return withFallback(real, DEMO_REVENUE, useReal);
	}, [bookings, range, useReal]);

	const deviceData = useMemo(() => {
		const real = buildDeviceBreakdown(bookings);
		return withFallback(real, DEMO_DEVICES, useReal);
	}, [bookings, useReal]);

	const repairTypeData = useMemo(() => {
		const real = buildIssueRevenue(bookings);
		return withFallback(real, DEMO_REPAIR_TYPES, useReal);
	}, [bookings, useReal]);

	const ratingTrend = useMemo(() => {
		const real = buildRatingTrend(reviews, range);
		return withFallback(real, DEMO_RATING, reviews.length > 0);
	}, [reviews, range]);

	const topClients = useMemo(() => {
		const real = buildTopClients(bookings);
		return withFallback(real, DEMO_CLIENTS, useReal);
	}, [bookings, useReal]);

	const completedCount = useMemo(() => {
		if (useReal) return technicianUser?.completedJobsCount ?? getCompletedBookings(bookings).length;
		return 137;
	}, [bookings, technicianUser, useReal]);

	const completionRate = useMemo(() => {
		const rate = computeCompletionRate(bookings);
		return rate != null && useReal ? `${rate}%` : '94%';
	}, [bookings, useReal]);

	const repeatRate = useMemo(() => {
		const rate = computeRepeatClientRate(bookings);
		return rate != null && useReal ? `${rate}%` : '38%';
	}, [bookings, useReal]);

	const avgRating = useMemo(() => {
		if (useReal && technicianUser?.averageRating) return technicianUser.averageRating.toFixed(1);
		return '4.9';
	}, [technicianUser, useReal]);

	const ratingAvgDisplay = useMemo(() => {
		if (ratingTrend.length === 0) return '4.9';
		const avg = ratingTrend.reduce((s, p) => s + p.rating, 0) / ratingTrend.length;
		return avg.toFixed(1);
	}, [ratingTrend]);

	const revMax = Math.max(100000, ...revenueSeries.map((d) => d.revenue));
	const revTicks = buildKrwTicks(revMax, 4);
	const jobsMax = Math.max(2, ...revenueSeries.map((d) => d.jobs));
	const repairMax = Math.max(100000, ...repairTypeData.map((d) => d.revenue));
	const repairTicks = buildKrwTicks(repairMax, 4);

	const ratingMin = Math.max(4, Math.min(...ratingTrend.map((d) => d.rating)) - 0.1);
	const ratingMax = Math.min(5, Math.max(...ratingTrend.map((d) => d.rating)) + 0.05);

	const kpis = [
		{ icon: <WorkOutlineOutlined style={{ fontSize: 20, color: '#FF6B00' }} />, bg: 'rgba(255,107,0,0.12)', trend: '+12%', value: String(completedCount), label: 'Total Jobs' },
		{ icon: <BoltOutlined style={{ fontSize: 20, color: '#22C55E' }} />, bg: 'rgba(34,197,94,0.12)', trend: '+3%', value: completionRate, label: 'Completion Rate' },
		{ icon: <AccessTimeOutlined style={{ fontSize: 20, color: '#3B82F6' }} />, bg: 'rgba(59,130,246,0.12)', trend: '-4m', value: '11m', label: 'Avg Response' },
		{ icon: <GroupOutlined style={{ fontSize: 20, color: '#A855F7' }} />, bg: 'rgba(168,85,247,0.12)', trend: '+6%', value: repeatRate, label: 'Repeat Clients' },
		{ icon: <StarBorderOutlined style={{ fontSize: 20, color: '#F59E0B' }} />, bg: 'rgba(245,158,11,0.12)', trend: '+0.1', value: avgRating, label: 'Avg Rating' },
		{ icon: <EmojiEventsOutlined style={{ fontSize: 20, color: '#FF6B00' }} />, bg: 'rgba(255,107,0,0.12)', trend: 'rank', value: 'Top 3%', label: 'Top Performer' },
	];

	return (
		<div className="fixora-an-page">
			<div className="fixora-an-header">
				<div>
					<h1 className="fixora-an-header__title">Performance Analytics</h1>
					<p className="fixora-an-header__sub">Track your repair business metrics and trends</p>
				</div>
				<div className="fixora-an-range">
					{RANGES.map((r) => (
						<button
							key={r}
							className={`fixora-an-range__btn ${range === r ? 'fixora-an-range__btn--active' : ''}`}
							onClick={() => setRange(r)}
							type="button"
						>
							{r}
						</button>
					))}
				</div>
			</div>

			<div className="fixora-an-kpis">
				{kpis.map((k) => (
					<div key={k.label} className="fixora-an-kpi">
						<div className="fixora-an-kpi__top">
							<div className="fixora-an-kpi__icon" style={{ background: k.bg }}>{k.icon}</div>
							<div className="fixora-an-kpi__trend">
								<TrendingUpOutlined style={{ fontSize: 13 }} /> {k.trend}
							</div>
						</div>
						<div className="fixora-an-kpi__value">{k.value}</div>
						<div className="fixora-an-kpi__label">{k.label}</div>
					</div>
				))}
			</div>

			<div className="fixora-an-row fixora-an-row--2-1">
				<div className="fixora-an-card">
					<div className="fixora-an-card__head">
						<h2 className="fixora-an-card__title">Jobs Completed vs Revenue</h2>
						<span className="fixora-an-card__hint">{range}</span>
					</div>
					<div className="fixora-an-chart">
						<ResponsiveContainer width="100%" height="100%">
							<ComposedChart data={revenueSeries} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
								<defs>
									<linearGradient id="anRevFill" x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%" stopColor="#FF9A3C" stopOpacity={0.22} />
										<stop offset="100%" stopColor="#FF6B00" stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
								<XAxis dataKey="day" stroke="#5A5A5A" tick={{ fontSize: 12, fill: '#808080' }} axisLine={false} tickLine={false} />
								<YAxis yAxisId="left" stroke="#5A5A5A" tick={{ fontSize: 12, fill: '#707070' }} axisLine={false} tickLine={false} domain={[0, revTicks[revTicks.length - 1]]} ticks={revTicks} tickFormatter={(v) => formatKrwCompact(v)} />
								<YAxis yAxisId="right" orientation="right" stroke="#5A5A5A" tick={{ fontSize: 12, fill: '#707070' }} axisLine={false} tickLine={false} domain={[0, jobsMax]} />
								<Tooltip content={<RevenueTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.15)' }} />
								<Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#FF6B00" strokeWidth={1.5} fill="url(#anRevFill)" />
								<Line yAxisId="right" type="monotone" dataKey="jobs" stroke="#3B82F6" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#3B82F6' }} />
							</ComposedChart>
						</ResponsiveContainer>
					</div>
					<div className="fixora-an-legend">
						<span className="fixora-an-legend__item"><span className="fixora-an-legend__line" style={{ background: '#FF6B00' }} /> Revenue</span>
						<span className="fixora-an-legend__item"><span className="fixora-an-legend__line" style={{ background: '#3B82F6' }} /> Jobs Completed</span>
					</div>
				</div>

				<div className="fixora-an-card">
					<div className="fixora-an-card__head">
						<h2 className="fixora-an-card__title">Repairs by Device</h2>
					</div>
					<div className="fixora-an-donut">
						<ResponsiveContainer width="100%" height={180}>
							<PieChart>
								<Pie data={deviceData} dataKey="value" innerRadius={52} outerRadius={78} paddingAngle={3} stroke="none">
									{deviceData.map((d) => (
										<Cell key={d.name} fill={d.color} />
									))}
								</Pie>
							</PieChart>
						</ResponsiveContainer>
					</div>
					<div className="fixora-an-devlist">
						{deviceData.map((d) => (
							<div key={d.name} className="fixora-an-devrow">
								<span className="fixora-an-devrow__dot" style={{ background: d.color }} />
								<span className="fixora-an-devrow__name">{d.name}</span>
								<span className="fixora-an-devrow__track">
									<span className="fixora-an-devrow__bar" style={{ width: `${d.value}%`, background: d.color }} />
								</span>
								<span className="fixora-an-devrow__pct">{d.value}%</span>
							</div>
						))}
					</div>
				</div>
			</div>

			<div className="fixora-an-row fixora-an-row--2-1">
				<div className="fixora-an-card">
					<div className="fixora-an-card__head">
						<h2 className="fixora-an-card__title">Revenue by Repair Type</h2>
					</div>
					<div className="fixora-an-chart">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={repairTypeData} margin={{ top: 10, right: 8, left: -8, bottom: 0 }} barCategoryGap="32%">
								<CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
								<XAxis dataKey="type" stroke="#5A5A5A" tick={{ fontSize: 12, fill: '#808080' }} axisLine={false} tickLine={false} />
								<YAxis stroke="#5A5A5A" tick={{ fontSize: 12, fill: '#707070' }} axisLine={false} tickLine={false} domain={[0, repairTicks[repairTicks.length - 1]]} ticks={repairTicks} tickFormatter={(v) => formatKrwCompact(v)} />
								<Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} contentStyle={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} formatter={(v: any) => [formatKrw(v), 'Revenue']} />
								<Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={46}>
									{repairTypeData.map((d) => (
										<Cell key={d.type} fill={d.color} />
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>

				<div className="fixora-an-card">
					<div className="fixora-an-card__head">
						<h2 className="fixora-an-card__title">Rating Trend</h2>
					</div>
					<div className="fixora-an-rating">
						<span className="fixora-an-rating__value">{ratingAvgDisplay}</span>
						<span className="fixora-an-rating__sub">avg this period</span>
					</div>
					<div className="fixora-an-chart fixora-an-chart--sm">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={ratingTrend} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
								<defs>
									<linearGradient id="anRatingFill" x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%" stopColor="#FF9A3C" stopOpacity={0.25} />
										<stop offset="100%" stopColor="#FF6B00" stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
								<XAxis dataKey="week" stroke="#5A5A5A" tick={{ fontSize: 11, fill: '#808080' }} axisLine={false} tickLine={false} />
								<YAxis stroke="#5A5A5A" tick={{ fontSize: 11, fill: '#707070' }} axisLine={false} tickLine={false} domain={[ratingMin, ratingMax]} />
								<Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
								<Area type="monotone" dataKey="rating" stroke="#FF9A3C" strokeWidth={2.5} fill="url(#anRatingFill)" dot={false} />
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>

			<div className="fixora-an-card">
				<div className="fixora-an-card__head">
					<h2 className="fixora-an-card__title">Top Clients</h2>
					<span className="fixora-an-card__hint">By lifetime revenue</span>
				</div>
				<div className="fixora-an-clients">
					{topClients.map((c) => (
						<div key={c.name} className="fixora-an-client">
							<div className="fixora-an-client__head">
								<div className="fixora-an-client__avatar">{c.initial}</div>
								<div>
									<div className="fixora-an-client__name">{c.name}</div>
									<div className="fixora-an-client__stars">
										{Array.from({ length: 5 }).map((_, i) => (
											<StarRounded key={i} style={{ fontSize: 13, color: i < c.stars ? '#F59E0B' : '#3A3A3A' }} />
										))}
									</div>
								</div>
							</div>
							<div className="fixora-an-client__amount">{c.amount}</div>
							<div className="fixora-an-client__jobs">{c.jobs}</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default withTechnicianLayout(Analytics);
