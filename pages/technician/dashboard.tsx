import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { technicianPageProps } from '../../libs/i18n/technicianPageProps';
import { dateLocale } from '../../libs/utils/i18nLocale';
import { formatClockTime, formatDueDate, formatTimeAgo } from '../../libs/utils/i18nTime';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import BoltOutlined from '@mui/icons-material/BoltOutlined';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import CalendarTodayOutlined from '@mui/icons-material/CalendarTodayOutlined';
import NorthEastOutlined from '@mui/icons-material/NorthEastOutlined';
import MailOutline from '@mui/icons-material/MailOutline';
import WorkOutlineOutlined from '@mui/icons-material/WorkOutlineOutlined';
import AttachMoneyOutlined from '@mui/icons-material/AttachMoneyOutlined';
import StarOutlined from '@mui/icons-material/StarOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import SmartphoneOutlined from '@mui/icons-material/SmartphoneOutlined';
import TabletMacOutlined from '@mui/icons-material/TabletMacOutlined';
import LaptopMacOutlined from '@mui/icons-material/LaptopMacOutlined';
import WatchOutlined from '@mui/icons-material/WatchOutlined';
import BuildOutlined from '@mui/icons-material/BuildOutlined';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import AddRounded from '@mui/icons-material/AddRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import withTechnicianLayout from '../../libs/components/layout/TechnicianLayout';
import { GET_INCOMING_REQUESTS, GET_TECHNICIAN_BOOKINGS, UPDATE_USER } from '../../apollo/user/profile';
import { GET_USER, GET_TECHNICIAN_REVIEWS } from '../../apollo/user/query';
import { userVar } from '../../apollo/store';
import AddScheduleModal, { NewScheduleItem } from '../../libs/components/technician/AddScheduleModal';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { formatKrw, formatKrwCompact } from '../../libs/utils/formatCurrency';
import {
	buildDashboardMonthSeries,
	buildDashboardWeekSeries,
	buildDashboardYearSeries,
	customerName,
	deviceServiceLabel,
	hasSeriesData,
	parsePrice,
} from '../../libs/utils/technicianMetrics';

type Period = 'Week' | 'Month' | 'Year';

interface CustomScheduleItem {
	id: string;
	when: string; // ISO datetime (today)
	task: string;
	client: string;
}

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: await technicianPageProps(locale),
});

const DeviceIcon = ({ type }: { type?: string | null }) => {
	const sx = { fontSize: 18, color: '#9A9A9A' } as const;
	switch (type) {
		case 'IPHONE':
			return <SmartphoneOutlined style={sx} />;
		case 'IPAD':
			return <TabletMacOutlined style={sx} />;
		case 'MACBOOK':
			return <LaptopMacOutlined style={sx} />;
		case 'APPLE_WATCH':
			return <WatchOutlined style={sx} />;
		default:
			return <BuildOutlined style={sx} />;
	}
};

const customerInitial = (entity?: any) => {
	const name = customerName(entity);
	return name ? name.charAt(0).toUpperCase() : 'C';
};

const deviceLabel = deviceServiceLabel;

const inferComplexity = (title?: string | null, desc?: string | null): string => {
	const t = ((title || '') + ' ' + (desc || '')).toLowerCase();
	if (t.match(/crack|shatter|broken|water.dam|flood|not.turn|dead|motherboard|logic.board/)) return 'HIGH';
	if (t.match(/battery|charg|slow|fan|overheat|screen|display|repair/)) return 'MEDIUM';
	return 'LOW';
};

const urgencyInfo = (complexity: string | null | undefined, title: string | null | undefined, desc: string | null | undefined, t: (key: string) => string) => {
	const level = complexity || inferComplexity(title, desc);
	switch (level) {
		case 'HIGH':
			return { label: t('urgency.high'), color: '#EF4444', bg: 'rgba(239,68,68,0.12)' };
		case 'LOW':
			return { label: t('urgency.low'), color: '#22C55E', bg: 'rgba(34,197,94,0.12)' };
		default:
			return { label: t('urgency.medium'), color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' };
	}
};

const bookingPrice = (booking: any): string | null => {
	const num = parsePrice(booking);
	return num > 0 ? formatKrw(num) : null;
};

const jobStatusInfo = (status: string, t: (key: string) => string) => {
	switch (status) {
		case 'IN_PROGRESS':
			return { label: t('jobStatus.inProgress'), color: '#FF6B00', bg: 'rgba(255,107,0,0.12)' };
		case 'ACCEPTED':
			return { label: t('jobStatus.diagnosing'), color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' };
		default:
			return { label: t('jobStatus.partsOrdered'), color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' };
	}
};

const jobProgress = (booking: any) => {
	if (booking?.bookingStatus === 'COMPLETED') return 100;
	const steps = booking?.progressUpdates?.length ?? 0;
	if (booking?.bookingStatus === 'IN_PROGRESS') return Math.min(90, 45 + steps * 12);
	if (booking?.bookingStatus === 'ACCEPTED') return Math.min(35, 20 + steps * 8);
	return Math.min(60, 30 + steps * 10);
};

const scheduleDotColor = (status: string) => {
	switch (status) {
		case 'ACCEPTED':
			return '#3B82F6';
		case 'COMPLETED':
			return '#22C55E';
		case 'CANCELLED':
		case 'REJECTED':
			return '#404040';
		default:
			return '#FF6B00';
	}
};

const TechnicianDashboard: NextPage = () => {
	const { t } = useTranslation('technician');
	const router = useRouter();
	const locale = router.locale;
	const user = useReactiveVar(userVar);
	const [hoveredJob, setHoveredJob] = useState<string | null>(null);
	const [period, setPeriod] = useState<Period | null>(null);
	const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
	const [customSchedule, setCustomSchedule] = useState<CustomScheduleItem[]>([]);
	const scheduleRef = useRef<HTMLDivElement>(null);

	const [updateUser] = useMutation(UPDATE_USER);

	const { data: incomingRequestsData } = useQuery(GET_INCOMING_REQUESTS, {
		skip: !user?._id,
		variables: { input: { page: 1, limit: 100, search: {} } },
		fetchPolicy: 'network-only',
	});

	const { data: technicianBookingsData } = useQuery(GET_TECHNICIAN_BOOKINGS, {
		skip: !user?._id,
		variables: { input: { page: 1, limit: 100, search: {} } },
		fetchPolicy: 'network-only',
	});

	const { data: userData, refetch: refetchUser } = useQuery(GET_USER, {
		skip: !user?._id,
		variables: { userId: user?._id },
		fetchPolicy: 'network-only',
	});

	// Locally-stored custom schedule items (no backend schedule model — device only)
	const scheduleStorageKey = user?._id ? `fixora_tech_schedule_${user._id}` : '';
	useEffect(() => {
		if (!scheduleStorageKey) return;
		try {
			const raw = localStorage.getItem(scheduleStorageKey);
			setCustomSchedule(raw ? JSON.parse(raw) : []);
		} catch {
			setCustomSchedule([]);
		}
	}, [scheduleStorageKey]);

	const persistSchedule = (items: CustomScheduleItem[]) => {
		setCustomSchedule(items);
		try {
			if (scheduleStorageKey) localStorage.setItem(scheduleStorageKey, JSON.stringify(items));
		} catch {
			/* ignore storage errors */
		}
	};

	const { data: reviewsData } = useQuery(GET_TECHNICIAN_REVIEWS, {
		skip: !user?._id,
		variables: {
			input: {
				page: 1,
				limit: 3,
				sort: 'createdAt',
				direction: 'DESC',
				search: { technicianId: user?._id ?? '' },
			},
		},
		fetchPolicy: 'network-only',
	});

	const incomingRequests = useMemo(() => incomingRequestsData?.getIncomingRequests?.list ?? [], [incomingRequestsData]);
	const bookings = useMemo(() => technicianBookingsData?.getTechnicianBookings?.list ?? [], [technicianBookingsData]);
	const technicianUser = useMemo(() => userData?.getUser ?? null, [userData]);
	const reviews = useMemo(() => reviewsData?.getTechnicianReviews?.list ?? [], [reviewsData]);

	const activeJobs = useMemo(() => bookings.filter((b: any) => ['ACCEPTED', 'IN_PROGRESS'].includes(b?.bookingStatus)), [bookings]);
	const completedBookings = useMemo(() => bookings.filter((b: any) => b?.bookingStatus === 'COMPLETED'), [bookings]);

	const earnings = useMemo(() => {
		return completedBookings.reduce((sum: number, b: any) => sum + parsePrice(b), 0).toFixed(2);
	}, [completedBookings]);

	const weekData = useMemo(() => buildDashboardWeekSeries(completedBookings), [completedBookings]);
	const monthData = useMemo(() => buildDashboardMonthSeries(completedBookings), [completedBookings]);
	const yearData = useMemo(() => buildDashboardYearSeries(completedBookings), [completedBookings]);

	// Default to the smallest period that actually has earnings, so the line is never falsely empty
	const activePeriod: Period =
		period ?? (hasSeriesData(weekData) ? 'Week' : hasSeriesData(monthData) ? 'Month' : hasSeriesData(yearData) ? 'Year' : 'Week');
	const chartData = activePeriod === 'Year' ? yearData : activePeriod === 'Month' ? monthData : weekData;
	const periodEarnings = chartData.reduce((sum, d) => sum + d.earnings, 0);
	const chartYMax = Math.max(100, ...chartData.map((d) => d.earnings));

	const previousEarnings = useMemo(() => {
		const lastMonth = new Date();
		lastMonth.setMonth(lastMonth.getMonth() - 1);
		return completedBookings
			.filter((b: any) => new Date(b?.completedAt) < lastMonth)
			.reduce((sum: number, b: any) => sum + (parseFloat(b?.finalPrice) || 0), 0);
	}, [completedBookings]);

	const earningsChange = useMemo(() => {
		if (previousEarnings === 0) return 0;
		return (((parseFloat(earnings as string) - previousEarnings) / previousEarnings) * 100).toFixed(1);
	}, [earnings, previousEarnings]);

	const rating = useMemo(() => technicianUser?.averageRating ?? 0, [technicianUser]);

	const requestsChange = useMemo(() => {
		const lastMonth = new Date();
		lastMonth.setMonth(lastMonth.getMonth() - 1);
		const previousCount = incomingRequests.filter((b: any) => new Date(b?.createdAt) < lastMonth).length;
		if (previousCount === 0) return 0;
		return (((incomingRequests.length - previousCount) / previousCount) * 100).toFixed(0);
	}, [incomingRequests]);

	const jobsChange = useMemo(() => {
		const lastMonth = new Date();
		lastMonth.setMonth(lastMonth.getMonth() - 1);
		const previousCount = bookings.filter((b: any) =>
			['ACCEPTED', 'IN_PROGRESS'].includes(b?.bookingStatus) &&
			new Date(b?.createdAt) < lastMonth
		).length;
		if (previousCount === 0) return 0;
		return (((activeJobs.length - previousCount) / previousCount) * 100).toFixed(0);
	}, [bookings, activeJobs]);

	const hasEarningsData = useMemo(() => hasSeriesData(chartData), [chartData]);

	// Booking-derived schedule merged with locally-saved custom items, sorted by time
	const mergedSchedule = useMemo(() => {
		const fromBookings = bookings
			.filter((b: any) => b?.bookingDate && !['CANCELLED', 'REJECTED'].includes(b?.bookingStatus))
			.map((b: any) => ({
				id: b._id,
				when: new Date(b.bookingDate),
				task: b.problemTitle || t('dashboard.repairTask'),
				client: customerName(b),
				status: b.bookingStatus as string,
				custom: false,
			}));
		const fromCustom = customSchedule.map((c) => ({
			id: c.id,
			when: new Date(c.when),
			task: c.task,
			client: c.client,
			status: 'CUSTOM',
			custom: true,
		}));
		return [...fromBookings, ...fromCustom]
			.filter((s) => !Number.isNaN(s.when.getTime()))
			.sort((a, b) => a.when.getTime() - b.when.getTime())
			.slice(0, 8);
	}, [bookings, customSchedule, t]);

	// ---- Handlers ----
	const newQuoteHandler = () => router.push('/community/write');

	const markAvailableHandler = async () => {
		try {
			if (!user?._id) return;
			const next = !(technicianUser?.isOnline ?? false);
			await updateUser({ variables: { input: { _id: user._id, isOnline: next } } });
			await refetchUser();
			await sweetTopSmallSuccessAlert(next ? t('status.nowAvailable') : t('status.nowOffline'), 900);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const viewScheduleHandler = () => scheduleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

	const exportReportHandler = () => router.push('/technician/earnings');

	const addScheduleHandler = (item: NewScheduleItem) => {
		const [h, m] = item.time.split(':');
		const when = new Date();
		when.setHours(Number(h) || 0, Number(m) || 0, 0, 0);
		const next = [
			...customSchedule,
			{ id: `sch_${Date.now()}`, when: when.toISOString(), task: item.task, client: item.client },
		];
		persistSchedule(next);
	};

	const removeScheduleHandler = (id: string) => {
		persistSchedule(customSchedule.filter((c) => c.id !== id));
	};

	return (
		<div className="fixora-tech-dashboard">
			{/* Welcome Section */}
			<div className="fixora-tech-dashboard__welcome">
				<div>
					<div className="fixora-tech-dashboard__date">
						{new Date().toLocaleDateString(dateLocale(locale), { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
					</div>
					<h1 className="fixora-tech-dashboard__greeting">
						{t('dashboard.greeting', {
							name: technicianUser?.userFullName?.trim().split(/\s+/)[0] || technicianUser?.userNickname || t('nav.fallbackName'),
						})}
					</h1>
					<p className="fixora-tech-dashboard__info">
						{t('dashboard.info', { requests: incomingRequests.length, jobs: activeJobs.length })}
					</p>
				</div>
				<div className="fixora-tech-dashboard__quick-actions">
					<button className="fixora-tech-quick-action fixora-tech-quick-action--orange" type="button" onClick={newQuoteHandler}>
							<BoltOutlined style={{ fontSize: 20 }} />
							<span>{t('dashboard.newQuote')}</span>
						</button>
					<button className="fixora-tech-quick-action fixora-tech-quick-action--green" type="button" onClick={markAvailableHandler}>
							<CheckCircleOutline style={{ fontSize: 20 }} />
							<span>{technicianUser?.isOnline ? t('dashboard.available') : t('dashboard.markAvailable')}</span>
						</button>
					<button className="fixora-tech-quick-action fixora-tech-quick-action--blue" type="button" onClick={viewScheduleHandler}>
							<CalendarTodayOutlined style={{ fontSize: 19 }} />
							<span>{t('dashboard.viewSchedule')}</span>
						</button>
					<button className="fixora-tech-quick-action fixora-tech-quick-action--purple" type="button" onClick={exportReportHandler}>
							<NorthEastOutlined style={{ fontSize: 20 }} />
							<span>{t('dashboard.exportReport')}</span>
						</button>
				</div>
			</div>

			{/* Stats */}
			<div className="fixora-tech-dashboard__stats">
				<div className="fixora-tech-stat-card">
						<div className="fixora-tech-stat-card__top">
							<div className="fixora-tech-stat-label">{t('dashboard.totalRequests')}</div>
							<div className="fixora-tech-stat-icon fixora-tech-stat-icon--orange"><MailOutline style={{ fontSize: 20 }} /></div>
						</div>
						<div className="fixora-tech-stat-value">{incomingRequests.length}</div>
						<div className="fixora-tech-stat-change">
							<TrendingUpOutlined style={{ fontSize: 13 }} />
							<span className="fixora-tech-stat-change__up">+{requestsChange}</span> {t('dashboard.vsLastWeek')}
						</div>
					</div>

				<div className="fixora-tech-stat-card">
						<div className="fixora-tech-stat-card__top">
							<div className="fixora-tech-stat-label">{t('dashboard.activeJobs')}</div>
							<div className="fixora-tech-stat-icon fixora-tech-stat-icon--blue"><WorkOutlineOutlined style={{ fontSize: 20 }} /></div>
						</div>
						<div className="fixora-tech-stat-value">{activeJobs.length}</div>
						<div className="fixora-tech-stat-change">
							<TrendingUpOutlined style={{ fontSize: 13 }} />
							<span className="fixora-tech-stat-change__up">+{jobsChange}</span> {t('dashboard.vsLastWeek')}
						</div>
					</div>

				<div className="fixora-tech-stat-card">
						<div className="fixora-tech-stat-card__top">
							<div className="fixora-tech-stat-label">{t('dashboard.thisWeek')}</div>
							<div className="fixora-tech-stat-icon fixora-tech-stat-icon--green"><AttachMoneyOutlined style={{ fontSize: 20 }} /></div>
						</div>
						<div className="fixora-tech-stat-value">{formatKrw(earnings)}</div>
						<div className="fixora-tech-stat-change">
							<TrendingUpOutlined style={{ fontSize: 13 }} />
							<span className="fixora-tech-stat-change__up">+{earningsChange}%</span> {t('dashboard.vsLastWeek')}
						</div>
					</div>

				<div className="fixora-tech-stat-card">
						<div className="fixora-tech-stat-card__top">
							<div className="fixora-tech-stat-label">{t('dashboard.avgRating')}</div>
							<div className="fixora-tech-stat-icon fixora-tech-stat-icon--yellow"><StarOutlined style={{ fontSize: 20 }} /></div>
						</div>
						<div className="fixora-tech-stat-value">{rating.toFixed(1)}</div>
						<div className="fixora-tech-stat-change">
							<TrendingUpOutlined style={{ fontSize: 13 }} />
							{t('dashboard.basedOnReviews', { count: technicianUser?.reviewCount ?? 0 })}
						</div>
					</div>
			</div>

			{/* Main Grid */}
			<div className="fixora-tech-dashboard__grid">
				{/* Incoming Requests */}
					<div className="fixora-tech-card fixora-tech-card--span-half">
						<div className="fixora-tech-card__header">
							<h2 className="fixora-tech-card__title">{t('dashboard.incomingRequests')}</h2>
							<a href="/technician/requests" className="fixora-tech-card__link">{t('dashboard.viewAll')}</a>
						</div>
						<div className="fixora-tech-card__list">
							{incomingRequests.length > 0 ? (
								incomingRequests.slice(0, 4).map((booking: any) => {
									const ug = urgencyInfo(booking?.aiClassification?.repairComplexity, booking?.problemTitle, booking?.problemDescription, t);
									const price = bookingPrice(booking);
									return (
										<div key={booking._id} className="fixora-tech-request-item">
											<div className="fixora-tech-request-icon"><DeviceIcon type={booking?.deviceData?.deviceCategory || booking?.aiClassification?.deviceType} /></div>
											<div className="fixora-tech-request-info">
												<div className="fixora-tech-request-top">
													<span className="fixora-tech-request-name">{customerName(booking)}</span>
													<span className="fixora-tech-urgency-badge" style={{ background: ug.bg, color: ug.color }}>{ug.label}</span>
												</div>
												<div className="fixora-tech-request-desc">
													{booking?.deviceData ? `${deviceLabel(booking)} • ${booking.problemTitle || t('dashboard.deviceRepair')}` : (booking.problemTitle || t('dashboard.deviceRepair'))}
												</div>
											</div>
											<div className="fixora-tech-request-meta">
												{price && <div className="fixora-tech-request-budget">{price}</div>}
												<div className="fixora-tech-request-time">{formatTimeAgo(booking.createdAt, t, locale)}</div>
											</div>
										</div>
									);
								})
							) : (
								<div className="fixora-tech-empty">{t('dashboard.noIncoming')}</div>
							)}
						</div>
					</div>

				{/* Active Jobs */}
					<div className="fixora-tech-card fixora-tech-card--span-half">
						<div className="fixora-tech-card__header">
							<h2 className="fixora-tech-card__title">{t('dashboard.activeJobs')}</h2>
							<a href="/technician/jobs" className="fixora-tech-card__link">{t('dashboard.viewAll')}</a>
						</div>
						<div className="fixora-tech-card__list">
							{activeJobs.length > 0 ? (
								activeJobs.slice(0, 3).map((booking: any) => {
									const status = jobStatusInfo(booking?.bookingStatus, t);
									const progress = jobProgress(booking);
									return (
										<div
											key={booking._id}
											className={`fixora-tech-job-item ${hoveredJob === booking._id ? 'fixora-tech-job-item--hovered' : ''}`}
											onMouseEnter={() => setHoveredJob(booking._id)}
											onMouseLeave={() => setHoveredJob(null)}
										>
											<div className="fixora-tech-job-top">
												<div className="fixora-tech-job-info">
													<div className="fixora-tech-request-icon"><DeviceIcon type={booking?.deviceData?.deviceCategory || booking?.aiClassification?.deviceType} /></div>
													<div>
														<div className="fixora-tech-request-name">{customerName(booking)}</div>
														<div className="fixora-tech-job-device">{deviceLabel(booking)}</div>
													</div>
												</div>
												<span className="fixora-tech-job-status" style={{ color: status.color }}>{status.label}</span>
											</div>
											<div className="fixora-tech-job-issue">{booking.problemDescription || t('dashboard.deviceRepair')}</div>
											<div className="fixora-tech-job-progress">
												<div className="fixora-tech-progress-track">
													<div className="prog-bar" style={{ '--prog-w': `${progress}%` } as React.CSSProperties} />
												</div>
												<span className="fixora-tech-progress-value">{progress}%</span>
												<span className="fixora-tech-job-due">{t('dashboard.due', { date: formatDueDate(booking.bookingDate, t, locale, booking.createdAt) })}</span>
											</div>
										</div>
									);
								})
							) : (
								<div className="fixora-tech-empty">{t('dashboard.noActiveJobs')}</div>
							)}
						</div>
					</div>

				{/* Earnings Chart */}
					<div className="fixora-tech-card fixora-tech-card--span-wide">
						<div className="fixora-tech-card__header">
							<div>
								<h2 className="fixora-tech-card__title">{t('dashboard.weeklyEarnings')}</h2>
								<div className="fixora-tech-earnings-info">
									<div className="fixora-tech-earnings-amount">{formatKrw(periodEarnings)}</div>
									<div className="fixora-tech-earnings-change"><TrendingUpOutlined style={{ fontSize: 13 }} /> +{earningsChange}% vs last week</div>
								</div>
							</div>
							<div className="fixora-tech-period-toggle">
								{(['Week', 'Month', 'Year'] as Period[]).map((p) => {
									const labelKey = p === 'Week' ? 'dashboard.periodWeek' : p === 'Month' ? 'dashboard.periodMonth' : 'dashboard.periodYear';
									return (
									<button
										key={p}
										type="button"
										className={`fixora-tech-period-btn ${activePeriod === p ? 'fixora-tech-period-btn--active' : ''}`}
										onClick={() => setPeriod(p)}
									>
										{t(labelKey)}
									</button>
								);})}
							</div>
						</div>
						<div style={{ width: '100%', height: 180, marginTop: 16 }}>
							{hasEarningsData ? (
								<ResponsiveContainer width="100%" height={180} minWidth={0}>
									<AreaChart data={chartData}>
										<defs>
											<linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
												<stop offset="0%" stopColor="#FF9A3C" stopOpacity={0.35} />
												<stop offset="60%" stopColor="#FF6B00" stopOpacity={0.08} />
												<stop offset="100%" stopColor="#FF6B00" stopOpacity={0} />
											</linearGradient>
										</defs>
										<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
										<XAxis dataKey="label" stroke="#404040" tick={{ fontSize: 11, fill: '#606060' }} axisLine={false} tickLine={false} />
										<YAxis stroke="#404040" tick={{ fontSize: 11, fill: '#606060' }} axisLine={false} tickLine={false} domain={[0, chartYMax]} allowDecimals={false} tickFormatter={(v) => formatKrwCompact(v)} />
										<Tooltip
											contentStyle={{ background: '#1A1A1A', border: '1px solid rgba(255,107,0,0.2)', borderRadius: 8 }}
											labelStyle={{ color: '#A0A0A0', fontSize: 11 }}
											itemStyle={{ color: '#FF9A3C', fontSize: 13, fontWeight: 600 }}
											formatter={(v: any) => [formatKrw(v), t('dashboard.earningsTooltip')]}
										/>
										<Area
											type="monotone"
											dataKey="earnings"
											stroke="#FF6B00"
											strokeWidth={2.5}
											fill="url(#earningsGrad)"
											dot={false}
											isAnimationActive
										/>
									</AreaChart>
								</ResponsiveContainer>
							) : (
								<div className="fixora-tech-chart-empty">
									<span>{t('dashboard.noEarningsWeek')}</span>
								</div>
							)}
						</div>
					</div>

				{/* Today's Schedule */}
					<div className="fixora-tech-card fixora-tech-card--span-narrow" ref={scheduleRef}>
						<div className="fixora-tech-card__header">
							<h2 className="fixora-tech-card__title">{t('dashboard.todaySchedule')}</h2>
							<button className="fixora-tech-schedule-add" type="button" onClick={() => setScheduleModalOpen(true)}>
								<AddRounded style={{ fontSize: 16 }} /> {t('dashboard.add')}
							</button>
						</div>
						<div className="fixora-tech-schedule-list">
							{mergedSchedule.length > 0 ? (
								mergedSchedule.map((item, idx) => {
									const done = item.status === 'COMPLETED';
									const dotColor = item.custom ? '#FF6B00' : scheduleDotColor(item.status);
									return (
										<div key={item.id} className="fixora-tech-schedule-item" style={{ opacity: done ? 0.45 : 1 }}>
											<div className="fixora-tech-schedule-rail">
												<div className="fixora-tech-schedule-dot" style={{ background: done ? '#404040' : dotColor, boxShadow: done ? 'none' : `0 0 6px ${dotColor}` }} />
												{idx < mergedSchedule.length - 1 && <div className="fixora-tech-schedule-line" />}
											</div>
											<div className="fixora-tech-schedule-content">
												<div className="fixora-tech-schedule-time">{formatClockTime(item.when.toISOString(), locale)}</div>
												<div className="fixora-tech-schedule-task" style={{ color: done ? '#606060' : '#F0F0F0' }}>{item.task}</div>
												{item.client && <div className="fixora-tech-schedule-client">{item.client}</div>}
											</div>
											{item.custom ? (
													<button
														className="fixora-tech-schedule-del"
														type="button"
														onClick={() => removeScheduleHandler(item.id)}
														aria-label={t('dashboard.removeSchedule')}
													>
														<CloseRounded style={{ fontSize: 15 }} />
													</button>
												) : done ? (
													<CheckCircleOutline className="fixora-tech-schedule-done" style={{ fontSize: 15, color: '#22C55E' }} />
												) : (
													<AccessTimeOutlined className="fixora-tech-schedule-clock" style={{ fontSize: 15 }} />
												)}
										</div>
									);
								})
							) : (
								<div className="fixora-tech-empty">{t('dashboard.noScheduled')}</div>
							)}
						</div>
					</div>
			</div>

			<AddScheduleModal open={scheduleModalOpen} onClose={() => setScheduleModalOpen(false)} onAdd={addScheduleHandler} />

			{/* Recent Reviews (full width) */}
			<div className="fixora-tech-card">
						<div className="fixora-tech-card__header">
							<h2 className="fixora-tech-card__title">{t('dashboard.recentReviews')}</h2>
							<a href="/technician/profile" className="fixora-tech-card__link">{t('dashboard.viewAll')}</a>
						</div>
						<div className="fixora-tech-reviews-grid">
							{reviews.length > 0 ? (
								reviews.slice(0, 3).map((review: any) => (
									<div key={review._id} className="fixora-tech-review-card">
										<div className="fixora-tech-review-header">
											<div className="fixora-tech-review-avatar">{customerInitial(review)}</div>
											<div className="fixora-tech-review-info">
												<div className="fixora-tech-review-name">{customerName(review)}</div>
												<div className="fixora-tech-review-device">{t('dashboard.verifiedCustomer')}</div>
											</div>
											<div className="fixora-tech-review-date">
												{new Date(review.createdAt).toLocaleDateString(dateLocale(locale), { month: 'short', day: 'numeric' })}
											</div>
										</div>
										<div className="fixora-tech-review-stars">
											{Array.from({ length: 5 }).map((_, i) => (
												<StarOutlined
													key={i}
													style={{ fontSize: 13, color: i < Math.round(review.repairQuality || 5) ? '#FF9A3C' : '#3A3A3A' }}
												/>
											))}
										</div>
										<p className="fixora-tech-review-text">{review.reviewContent || t('dashboard.defaultReview')}</p>
									</div>
								))
							) : (
								<div className="fixora-tech-empty">{t('dashboard.noReviews')}</div>
							)}
						</div>
					</div>
		</div>
	);
};

export default withTechnicianLayout(TechnicianDashboard);
