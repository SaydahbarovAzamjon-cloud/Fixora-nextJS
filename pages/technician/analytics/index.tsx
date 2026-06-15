import React, { useState } from 'react';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
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

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: { ...(await serverSideTranslations(locale ?? 'en', ['common'])) },
});

const RANGES = ['7 Days', '30 Days', '3 Months', 'Year'];

const KPIS = [
	{ icon: <WorkOutlineOutlined style={{ fontSize: 20, color: '#FF6B00' }} />, bg: 'rgba(255,107,0,0.12)', trend: '+12%', value: '137', label: 'Total Jobs' },
	{ icon: <BoltOutlined style={{ fontSize: 20, color: '#22C55E' }} />, bg: 'rgba(34,197,94,0.12)', trend: '+3%', value: '94%', label: 'Completion Rate' },
	{ icon: <AccessTimeOutlined style={{ fontSize: 20, color: '#3B82F6' }} />, bg: 'rgba(59,130,246,0.12)', trend: '-4m', value: '11m', label: 'Avg Response' },
	{ icon: <GroupOutlined style={{ fontSize: 20, color: '#A855F7' }} />, bg: 'rgba(168,85,247,0.12)', trend: '+6%', value: '38%', label: 'Repeat Clients' },
	{ icon: <StarBorderOutlined style={{ fontSize: 20, color: '#F59E0B' }} />, bg: 'rgba(245,158,11,0.12)', trend: '+0.1', value: '4.9', label: 'Avg Rating' },
	{ icon: <EmojiEventsOutlined style={{ fontSize: 20, color: '#FF6B00' }} />, bg: 'rgba(255,107,0,0.12)', trend: 'rank', value: 'Top 3%', label: 'Top Performer' },
];

const revenueData = [
	{ day: 'Mon', revenue: 420, jobs: 3 },
	{ day: 'Tue', revenue: 680, jobs: 4 },
	{ day: 'Wed', revenue: 240, jobs: 2 },
	{ day: 'Thu', revenue: 980, jobs: 7 },
	{ day: 'Fri', revenue: 1150, jobs: 8 },
	{ day: 'Sat', revenue: 700, jobs: 5 },
	{ day: 'Sun', revenue: 300, jobs: 2 },
];

const deviceData = [
	{ name: 'iPhone', value: 54, color: '#FF6B00' },
	{ name: 'MacBook', value: 28, color: '#3B82F6' },
	{ name: 'iPad', value: 12, color: '#22C55E' },
	{ name: 'Apple Watch', value: 6, color: '#A855F7' },
];

const repairTypeData = [
	{ type: 'Screen', revenue: 6200, color: '#FF6B00' },
	{ type: 'Battery', revenue: 2700, color: '#FBBF77' },
	{ type: 'Water', revenue: 4200, color: '#3B82F6' },
	{ type: 'Camera', revenue: 2800, color: '#22C55E' },
	{ type: 'Logic', revenue: 5400, color: '#A855F7' },
	{ type: 'Charging', revenue: 1500, color: '#F5C518' },
];

const ratingTrend = [
	{ week: 'W1', rating: 4.65 },
	{ week: 'W2', rating: 4.7 },
	{ week: 'W3', rating: 4.78 },
	{ week: 'W4', rating: 4.82 },
	{ week: 'W5', rating: 4.85 },
	{ week: 'W6', rating: 4.95 },
	{ week: 'W7', rating: 4.9 },
];

const topClients = [
	{ name: 'Sarah', initial: 'S', stars: 5, amount: '$640', jobs: '4 jobs' },
	{ name: 'Daniel', initial: 'D', stars: 5, amount: '$890', jobs: '3 jobs' },
	{ name: 'James', initial: 'J', stars: 5, amount: '$720', jobs: '3 jobs' },
	{ name: 'Lily', initial: 'L', stars: 4, amount: '$760', jobs: '2 jobs' },
	{ name: 'Anna', initial: 'A', stars: 5, amount: '$1,360', jobs: '2 jobs' },
];

const RevenueTooltip = ({ active, payload, label }: any) => {
	if (!active || !payload?.length) return null;
	const rev = payload.find((p: any) => p.dataKey === 'revenue')?.value;
	const jobs = payload.find((p: any) => p.dataKey === 'jobs')?.value;
	return (
		<div className="fixora-an-tooltip">
			<div className="fixora-an-tooltip__title">{label}</div>
			<div className="fixora-an-tooltip__row" style={{ color: '#FF9A3C' }}>Revenue ($) : {rev}</div>
			<div className="fixora-an-tooltip__row" style={{ color: '#3B82F6' }}>Jobs : {jobs}</div>
		</div>
	);
};

const Analytics: NextPage = () => {
	const [range, setRange] = useState('7 Days');

	return (
		<div className="fixora-an-page">
			{/* Header */}
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

			{/* KPI cards */}
			<div className="fixora-an-kpis">
				{KPIS.map((k) => (
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

			{/* Row 1: revenue chart + device donut */}
			<div className="fixora-an-row fixora-an-row--2-1">
				<div className="fixora-an-card">
					<div className="fixora-an-card__head">
						<h2 className="fixora-an-card__title">Jobs Completed vs Revenue</h2>
						<span className="fixora-an-card__hint">{range}</span>
					</div>
					<div className="fixora-an-chart">
						<ResponsiveContainer width="100%" height="100%">
							<ComposedChart data={revenueData} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
								<defs>
									<linearGradient id="anRevFill" x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%" stopColor="#FF9A3C" stopOpacity={0.22} />
										<stop offset="100%" stopColor="#FF6B00" stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
								<XAxis dataKey="day" stroke="#5A5A5A" tick={{ fontSize: 12, fill: '#808080' }} axisLine={false} tickLine={false} />
								<YAxis yAxisId="left" stroke="#5A5A5A" tick={{ fontSize: 12, fill: '#707070' }} axisLine={false} tickLine={false} domain={[0, 1200]} ticks={[0, 300, 600, 900, 1200]} tickFormatter={(v) => `$${v}`} />
								<YAxis yAxisId="right" orientation="right" stroke="#5A5A5A" tick={{ fontSize: 12, fill: '#707070' }} axisLine={false} tickLine={false} domain={[0, 8]} ticks={[0, 2, 4, 6, 8]} />
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

			{/* Row 2: repair type bars + rating trend */}
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
								<YAxis stroke="#5A5A5A" tick={{ fontSize: 12, fill: '#707070' }} axisLine={false} tickLine={false} domain={[0, 8000]} ticks={[0, 2000, 4000, 6000, 8000]} tickFormatter={(v) => `$${v}`} />
								<Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} contentStyle={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} formatter={(v: any) => [`$${v}`, 'Revenue']} />
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
						<span className="fixora-an-rating__value">4.9</span>
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
								<YAxis stroke="#5A5A5A" tick={{ fontSize: 11, fill: '#707070' }} axisLine={false} tickLine={false} domain={[4.5, 5]} ticks={[4.5, 4.65, 4.8, 5]} />
								<Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
								<Area type="monotone" dataKey="rating" stroke="#FF9A3C" strokeWidth={2.5} fill="url(#anRatingFill)" dot={false} />
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>

			{/* Top clients */}
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
