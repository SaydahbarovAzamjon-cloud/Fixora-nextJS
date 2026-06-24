import React, { useMemo, useState } from 'react';
import { NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { technicianPageProps } from '../../../libs/i18n/technicianPageProps';
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
import { GET_TECHNICIAN_ANALYTICS, GET_TECHNICIAN_RANK } from '../../../apollo/user/analytics';
import { GET_TECHNICIAN_BOOKINGS } from '../../../apollo/user/profile';
import { GET_TECHNICIAN_REVIEWS } from '../../../apollo/user/query';
import { userVar } from '../../../apollo/store';
import { useTechnicianSelfProfile } from '../../../libs/hooks/useTechnicianSelfProfile';
import { buildKrwTicks, formatKrw, formatKrwCompact } from '../../../libs/utils/formatCurrency';
import { formatAvgResponseMinutes, formatTrendPercent } from '../../../libs/utils/formatResponseTime';
import {
	AnalyticsRange,
	buildDeviceBreakdown,
	buildIssueRevenue,
	buildRatingTrend,
	buildRevenueJobsSeries,
	buildTopClients,
	computeCompletionRate,
	computeRateDeltaTrend,
	computeRepeatClientRate,
	bookingsInAnalyticsRange,
	filterCompletedInRange,
	getCompletedBookings,
} from '../../../libs/utils/technicianMetrics';
import { useFixoraChartTheme } from '../../../libs/hooks/useFixoraChartTheme';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: await technicianPageProps(locale),
});

const RANGE_KEYS: Record<AnalyticsRange, string> = {
	'7 Days': 'analytics.range7Days',
	'30 Days': 'analytics.range30Days',
	'3 Months': 'analytics.range3Months',
	Year: 'analytics.rangeYear',
};

const RANGES: AnalyticsRange[] = ['7 Days', '30 Days', '3 Months', 'Year'];

const DEVICE_I18N_KEYS: Record<string, string> = {
	IPHONE: 'analytics.devices.iphone',
	MACBOOK: 'analytics.devices.macbook',
	IPAD: 'analytics.devices.ipad',
	APPLE_WATCH: 'analytics.devices.appleWatch',
};

const RevenueTooltip = ({ active, payload, label, t, chart }: any) => {
	if (!active || !payload?.length) return null;
	const rev = payload.find((p: any) => p.dataKey === 'revenue')?.value;
	const jobs = payload.find((p: any) => p.dataKey === 'jobs')?.value;
	return (
		<div className="fixora-an-tooltip">
			<div className="fixora-an-tooltip__title">{label}</div>
			<div className="fixora-an-tooltip__row" style={{ color: chart.primaryHover }}>
				{t('analytics.revenue')} : {formatKrw(rev ?? 0)}
			</div>
			<div className="fixora-an-tooltip__row" style={{ color: chart.blue }}>
				{t('analytics.tooltipJobs')} : {jobs}
			</div>
		</div>
	);
};

const AnalyticsEmpty = ({ message }: { message: string }) => (
	<div className="fixora-an-empty">{message}</div>
);

const Analytics: NextPage = () => {
	const { t } = useTranslation('technician');
	const chart = useFixoraChartTheme();
	const user = useReactiveVar(userVar);
	const [range, setRange] = useState<AnalyticsRange>('7 Days');

	const { data: bookingsData, loading: bookingsLoading } = useQuery(GET_TECHNICIAN_BOOKINGS, {
		skip: !user?._id,
		variables: { input: { page: 1, limit: 200, search: {} } },
		fetchPolicy: 'network-only',
	});

	const {
		data: analyticsData,
		loading: analyticsLoading,
		error: analyticsError,
	} = useQuery(GET_TECHNICIAN_ANALYTICS, {
		skip: !user?._id,
		variables: { technicianId: user?._id ?? '' },
		fetchPolicy: 'network-only',
		errorPolicy: 'all',
		context: { suppressErrorAlert: true },
	});

	const { data: rankData } = useQuery(GET_TECHNICIAN_RANK, {
		skip: !user?._id,
		variables: { technicianId: user?._id ?? '' },
		fetchPolicy: 'network-only',
		errorPolicy: 'all',
		context: { suppressErrorAlert: true },
	});

	const { profile: technicianUser } = useTechnicianSelfProfile(user?._id);

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
	const analytics = analyticsData?.getTechnicianAnalytics;
	const rank = rankData?.getTechnicianRank;
	const useAnalytics = !!analytics && !analyticsError;
	const loading = analyticsLoading || bookingsLoading;

	const revenueSeries = useMemo(() => buildRevenueJobsSeries(bookings, range), [bookings, range]);
	const deviceData = useMemo(
		() =>
			buildDeviceBreakdown(bookings).map((item) => ({
				...item,
				name: DEVICE_I18N_KEYS[item.category] ? t(DEVICE_I18N_KEYS[item.category]) : item.name,
			})),
		[bookings, t],
	);
	const repairTypeData = useMemo(
		() =>
			buildIssueRevenue(bookings).map((item) => ({
				...item,
				type: t(`analytics.issueTypes.${item.issueKey}`, { defaultValue: item.type }),
			})),
		[bookings, t],
	);
	const ratingTrend = useMemo(() => buildRatingTrend(reviews, range), [reviews, range]);
	const topClients = useMemo(() => buildTopClients(bookings), [bookings]);
	const rangedCompleted = useMemo(() => filterCompletedInRange(bookings, range), [bookings, range]);

	const completedCount = useMemo(() => {
		if (loading) return '—';
		if (bookings.length > 0) return String(rangedCompleted.length);
		if (useAnalytics) return String(analytics?.completedJobsCount ?? 0);
		return String(technicianUser?.completedJobsCount ?? getCompletedBookings(bookings).length);
	}, [loading, bookings, rangedCompleted, analytics, technicianUser, useAnalytics]);

	const completionRate = useMemo(() => {
		const rate = computeCompletionRate(bookingsInAnalyticsRange(bookings, range));
		return rate != null ? `${rate}%` : '—';
	}, [bookings, range]);

	const repeatRate = useMemo(() => {
		const rate = computeRepeatClientRate(filterCompletedInRange(bookings, range));
		return rate != null ? `${rate}%` : '—';
	}, [bookings, range]);

	const avgRating = useMemo(() => {
		if (useAnalytics && analytics?.averageRating != null) return analytics.averageRating.toFixed(1);
		if (technicianUser?.averageRating) return technicianUser.averageRating.toFixed(1);
		return '—';
	}, [analytics, technicianUser, useAnalytics]);

	const avgResponseDisplay = useMemo(() => {
		if (useAnalytics && analytics?.avgResponseMinutes != null) {
			return formatAvgResponseMinutes(analytics.avgResponseMinutes) ?? '—';
		}
		return '—';
	}, [analytics, useAnalytics]);

	const topPerformerDisplay = useMemo(() => {
		if (rank?.badgeLabel) return rank.badgeLabel;
		if (analytics?.topPerformerPercentile != null) {
			return `Top ${Math.round(analytics.topPerformerPercentile)}%`;
		}
		return '—';
	}, [analytics, rank]);

	const jobsTrend = useMemo(
		() => (useAnalytics ? formatTrendPercent(analytics?.completedJobsTrendPercent) : '—'),
		[analytics, useAnalytics],
	);
	const completionTrend = useMemo(
		() => computeRateDeltaTrend(bookings, range, computeCompletionRate) ?? '—',
		[bookings, range],
	);
	const responseTrend = useMemo(
		() => (useAnalytics ? formatTrendPercent(analytics?.avgResponseTrendPercent) : '—'),
		[analytics, useAnalytics],
	);
	const repeatTrend = useMemo(
		() => computeRateDeltaTrend(bookings, range, computeRepeatClientRate) ?? '—',
		[bookings, range],
	);
	const ratingTrendKpi = useMemo(() => {
		if (useAnalytics && analytics?.averageRatingTrendPercent != null) {
			const sign = analytics.averageRatingTrendPercent > 0 ? '+' : '';
			return `${sign}${analytics.averageRatingTrendPercent.toFixed(1)}`;
		}
		return '—';
	}, [analytics, useAnalytics]);
	const rankTrend = useMemo(() => {
		if (rank?.percentile != null) return `Top ${Math.round(rank.percentile)}%`;
		if (analytics?.topPerformerPercentile != null) {
			return `Top ${Math.round(analytics.topPerformerPercentile)}%`;
		}
		return '—';
	}, [analytics, rank]);

	const ratingAvgDisplay = useMemo(() => {
		if (ratingTrend.length === 0) return '—';
		const avg = ratingTrend.reduce((s, p) => s + p.rating, 0) / ratingTrend.length;
		return avg.toFixed(1);
	}, [ratingTrend]);

	const revMax = Math.max(100000, ...revenueSeries.map((d) => d.revenue));
	const revTicks = buildKrwTicks(revMax, 4);
	const jobsMax = Math.max(2, ...revenueSeries.map((d) => d.jobs));
	const repairMax = Math.max(100000, ...repairTypeData.map((d) => d.revenue));
	const repairTicks = buildKrwTicks(repairMax, 4);

	const ratingMin = ratingTrend.length > 0
		? Math.max(4, Math.min(...ratingTrend.map((d) => d.rating)) - 0.1)
		: 4;
	const ratingMax = ratingTrend.length > 0
		? Math.min(5, Math.max(...ratingTrend.map((d) => d.rating)) + 0.05)
		: 5;

	const kpis = [
		{ icon: <WorkOutlineOutlined style={{ fontSize: 20, color: chart.primary }} />, bg: 'var(--fixora-primary-soft-bg)', trend: jobsTrend, value: completedCount, label: t('analytics.totalJobs') },
		{ icon: <BoltOutlined style={{ fontSize: 20, color: '#22C55E' }} />, bg: 'rgba(34,197,94,0.12)', trend: completionTrend, value: loading ? '—' : completionRate, label: t('analytics.completionRate') },
		{ icon: <AccessTimeOutlined style={{ fontSize: 20, color: chart.blue }} />, bg: 'rgba(59,130,246,0.12)', trend: responseTrend, value: loading ? '—' : avgResponseDisplay, label: t('analytics.avgResponse') },
		{ icon: <GroupOutlined style={{ fontSize: 20, color: '#A855F7' }} />, bg: 'rgba(168,85,247,0.12)', trend: repeatTrend, value: loading ? '—' : repeatRate, label: t('analytics.repeatClients') },
		{ icon: <StarBorderOutlined style={{ fontSize: 20, color: '#F59E0B' }} />, bg: 'rgba(245,158,11,0.12)', trend: ratingTrendKpi, value: loading ? '—' : avgRating, label: t('analytics.avgRating') },
		{ icon: <EmojiEventsOutlined style={{ fontSize: 20, color: chart.primary }} />, bg: 'var(--fixora-primary-soft-bg)', trend: rankTrend, value: loading ? '—' : topPerformerDisplay, label: t('analytics.topPerformer') },
	];

	return (
		<div className="fixora-an-page">
			<div className="fixora-an-header">
				<div>
					<h1 className="fixora-an-header__title">{t('analytics.title')}</h1>
					<p className="fixora-an-header__sub">{t('analytics.subtitle')}</p>
				</div>
				<div className="fixora-an-range">
					{RANGES.map((r) => (
						<button
							key={r}
							className={`fixora-an-range__btn ${range === r ? 'fixora-an-range__btn--active' : ''}`}
							onClick={() => setRange(r)}
							type="button"
						>
							{t(RANGE_KEYS[r])}
						</button>
					))}
				</div>
			</div>

			{analyticsError && (
				<div className="fixora-an-header__sub" role="alert" style={{ color: '#F87171', marginBottom: 16 }}>
					{t('analytics.loadError')}
				</div>
			)}

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
						<h2 className="fixora-an-card__title">{t('analytics.jobsVsRevenue')}</h2>
						<span className="fixora-an-card__hint">{t(RANGE_KEYS[range])}</span>
					</div>
					<div className="fixora-an-chart">
						{revenueSeries.length === 0 ? (
							<AnalyticsEmpty message={t('analytics.noData')} />
						) : (
							<ResponsiveContainer width="100%" height="100%">
								<ComposedChart data={revenueSeries} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
									<defs>
										<linearGradient id="anRevFill" x1="0" y1="0" x2="0" y2="1">
											<stop offset="0%" stopColor={chart.primaryHover} stopOpacity={0.22} />
											<stop offset="100%" stopColor={chart.primary} stopOpacity={0} />
										</linearGradient>
									</defs>
									<CartesianGrid strokeDasharray="4 4" stroke={chart.grid} vertical={false} />
									<XAxis dataKey="day" stroke={chart.axisMuted} tick={{ fontSize: 12, fill: chart.axis }} axisLine={false} tickLine={false} />
									<YAxis yAxisId="left" stroke={chart.axisMuted} tick={{ fontSize: 12, fill: chart.axisMuted }} axisLine={false} tickLine={false} domain={[0, revTicks[revTicks.length - 1]]} ticks={revTicks} tickFormatter={(v) => formatKrwCompact(v)} />
									<YAxis yAxisId="right" orientation="right" stroke={chart.axisMuted} tick={{ fontSize: 12, fill: chart.axisMuted }} axisLine={false} tickLine={false} domain={[0, jobsMax]} />
									<Tooltip content={<RevenueTooltip t={t} chart={chart} />} cursor={{ stroke: chart.tooltipCursor }} />
									<Area yAxisId="left" type="monotone" dataKey="revenue" stroke={chart.primary} strokeWidth={1.5} fill="url(#anRevFill)" />
									<Line yAxisId="right" type="monotone" dataKey="jobs" stroke={chart.blue} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: chart.blue }} />
								</ComposedChart>
							</ResponsiveContainer>
						)}
					</div>
					<div className="fixora-an-legend">
						<span className="fixora-an-legend__item"><span className="fixora-an-legend__line" style={{ background: chart.primary }} /> {t('analytics.revenue')}</span>
						<span className="fixora-an-legend__item"><span className="fixora-an-legend__line" style={{ background: chart.blue }} /> {t('analytics.jobsCompleted')}</span>
					</div>
				</div>

				<div className="fixora-an-card">
					<div className="fixora-an-card__head">
						<h2 className="fixora-an-card__title">{t('analytics.repairsByDevice')}</h2>
					</div>
					{deviceData.length === 0 ? (
						<AnalyticsEmpty message={t('analytics.noData')} />
					) : (
						<>
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
						</>
					)}
				</div>
			</div>

			<div className="fixora-an-row fixora-an-row--2-1">
				<div className="fixora-an-card">
					<div className="fixora-an-card__head">
						<h2 className="fixora-an-card__title">{t('analytics.revenueByType')}</h2>
					</div>
					<div className="fixora-an-chart">
						{repairTypeData.length === 0 ? (
							<AnalyticsEmpty message={t('analytics.noData')} />
						) : (
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={repairTypeData} margin={{ top: 10, right: 8, left: -8, bottom: 0 }} barCategoryGap="32%">
									<CartesianGrid strokeDasharray="4 4" stroke={chart.grid} vertical={false} />
									<XAxis dataKey="type" stroke={chart.axisMuted} tick={{ fontSize: 12, fill: chart.axis }} axisLine={false} tickLine={false} />
									<YAxis stroke={chart.axisMuted} tick={{ fontSize: 12, fill: chart.axisMuted }} axisLine={false} tickLine={false} domain={[0, repairTicks[repairTicks.length - 1]]} ticks={repairTicks} tickFormatter={(v) => formatKrwCompact(v)} />
									<Tooltip cursor={{ fill: chart.barHover }} contentStyle={{ background: 'var(--fixora-surface-elevated)', border: '1px solid var(--fixora-border-subtle)', borderRadius: 8 }} formatter={(v: any) => [formatKrw(v), t('analytics.revenue')]} />
									<Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={46}>
										{repairTypeData.map((d) => (
											<Cell key={d.type} fill={d.color} />
										))}
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						)}
					</div>
				</div>

				<div className="fixora-an-card">
					<div className="fixora-an-card__head">
						<h2 className="fixora-an-card__title">{t('analytics.ratingTrend')}</h2>
					</div>
					<div className="fixora-an-rating">
						<span className="fixora-an-rating__value">{ratingAvgDisplay}</span>
						<span className="fixora-an-rating__sub">{t('analytics.avgThisPeriod')}</span>
					</div>
					<div className="fixora-an-chart fixora-an-chart--sm">
						{ratingTrend.length === 0 ? (
							<AnalyticsEmpty message={t('analytics.noData')} />
						) : (
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart data={ratingTrend} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
									<defs>
										<linearGradient id="anRatingFill" x1="0" y1="0" x2="0" y2="1">
											<stop offset="0%" stopColor={chart.primaryHover} stopOpacity={0.25} />
											<stop offset="100%" stopColor={chart.primary} stopOpacity={0} />
										</linearGradient>
									</defs>
									<CartesianGrid strokeDasharray="4 4" stroke={chart.grid} vertical={false} />
									<XAxis dataKey="week" stroke={chart.axisMuted} tick={{ fontSize: 11, fill: chart.axis }} axisLine={false} tickLine={false} />
									<YAxis stroke={chart.axisMuted} tick={{ fontSize: 11, fill: chart.axisMuted }} axisLine={false} tickLine={false} domain={[ratingMin, ratingMax]} />
									<Tooltip contentStyle={{ background: 'var(--fixora-surface-elevated)', border: '1px solid var(--fixora-border-subtle)', borderRadius: 8 }} />
									<Area type="monotone" dataKey="rating" stroke={chart.primaryHover} strokeWidth={2.5} fill="url(#anRatingFill)" dot={false} />
								</AreaChart>
							</ResponsiveContainer>
						)}
					</div>
				</div>
			</div>

			<div className="fixora-an-card">
				<div className="fixora-an-card__head">
					<h2 className="fixora-an-card__title">{t('analytics.topClients')}</h2>
					<span className="fixora-an-card__hint">{t('analytics.byLifetimeRevenue')}</span>
				</div>
				{topClients.length === 0 ? (
					<AnalyticsEmpty message={t('analytics.noClients')} />
				) : (
					<div className="fixora-an-clients">
						{topClients.map((c) => (
							<div key={c.name} className="fixora-an-client">
								<div className="fixora-an-client__head">
									<div className="fixora-an-client__avatar">{c.initial}</div>
									<div>
										<div className="fixora-an-client__name">{c.name}</div>
										<div className="fixora-an-client__stars">
											{Array.from({ length: 5 }).map((_, i) => (
												<StarRounded key={i} style={{ fontSize: 13, color: i < c.stars ? chart.starActive : chart.starInactive }} />
											))}
										</div>
									</div>
								</div>
								<div className="fixora-an-client__amount">{c.amount}</div>
								<div className="fixora-an-client__jobs">{c.jobs}</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default withTechnicianLayout(Analytics);
