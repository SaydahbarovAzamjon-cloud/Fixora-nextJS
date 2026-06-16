import React, { useMemo, useState } from 'react';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useQuery, useReactiveVar } from '@apollo/client';
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
import withTechnicianLayout from '../../libs/components/layout/TechnicianLayout';
import { GET_INCOMING_REQUESTS, GET_TECHNICIAN_BOOKINGS } from '../../apollo/user/profile';
import { GET_USER, GET_TECHNICIAN_REVIEWS } from '../../apollo/user/query';
import { userVar } from '../../apollo/store';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	},
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

const formatMoney = (value: number | string) => {
	const num = typeof value === 'string' ? parseFloat(value) : value;
	if (Number.isNaN(num)) return '0';
	return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
};

const customerName = (entity?: any) =>
	entity?.customerData?.userFullName || entity?.customerData?.userNickname || 'Customer';

const customerInitial = (entity?: any) => {
	const name = entity?.customerData?.userFullName || entity?.customerData?.userNickname;
	return name ? name.charAt(0).toUpperCase() : 'C';
};

const deviceLabel = (booking?: any) => {
	const d = booking?.deviceData;
	// Show the model alone ("iPhone 15 Plus", "MacBook Air M2") — the brand is
	// redundant for Apple devices and would render "APPLE Apple Watch SE 2".
	return d?.deviceModel?.trim() || d?.deviceBrand?.trim() || booking?.problemTitle || 'Repair';
};

const inferComplexity = (title?: string | null, desc?: string | null): string => {
	const t = ((title || '') + ' ' + (desc || '')).toLowerCase();
	if (t.match(/crack|shatter|broken|water.dam|flood|not.turn|dead|motherboard|logic.board/)) return 'HIGH';
	if (t.match(/battery|charg|slow|fan|overheat|screen|display|repair/)) return 'MEDIUM';
	return 'LOW';
};

const urgencyInfo = (complexity?: string | null, title?: string | null, desc?: string | null) => {
	const level = complexity || inferComplexity(title, desc);
	switch (level) {
		case 'HIGH':
			return { label: 'high', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' };
		case 'LOW':
			return { label: 'low', color: '#22C55E', bg: 'rgba(34,197,94,0.12)' };
		default:
			return { label: 'medium', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' };
	}
};

const bookingPrice = (booking: any): string | null => {
	const raw = booking?.estimatedPrice ?? booking?.finalPrice ?? booking?.serviceFee ?? booking?.aiClassification?.estimatedCost ?? booking?.price;
	if (raw == null) return null;
	const num = parseFloat(raw);
	return Number.isNaN(num) ? null : `$${Math.round(num)}`;
};

const jobStatusInfo = (status: string) => {
	switch (status) {
		case 'IN_PROGRESS':
			return { label: 'In Progress', color: '#FF6B00', bg: 'rgba(255,107,0,0.12)' };
		case 'ACCEPTED':
			return { label: 'Diagnosing', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' };
		default:
			return { label: 'Parts Ordered', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' };
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

const timeAgo = (dateStr?: string | null) => {
	if (!dateStr) return '';
	const date = new Date(dateStr);
	const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
	if (minutes < 1) return 'just now';
	if (minutes < 60) return `${minutes} min ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatDue = (dateStr?: string | null, createdAt?: string | null) => {
	let date: Date | null = null;
	let isEstimate = false;
	if (dateStr) {
		date = new Date(dateStr);
	} else if (createdAt) {
		date = new Date(createdAt);
		date.setDate(date.getDate() + 3);
		isEstimate = true;
	}
	if (!date || Number.isNaN(date.getTime())) return 'TBD';
	const now = new Date();
	const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
	if (date.toDateString() === now.toDateString()) return `Today ${time}`;
	const tomorrow = new Date(now);
	tomorrow.setDate(now.getDate() + 1);
	if (date.toDateString() === tomorrow.toDateString()) return `Tomorrow ${time}`;
	const label = `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${time}`;
	return isEstimate ? `~${label}` : label;
};

const formatTime = (dateStr?: string | null) => {
	if (!dateStr) return '--';
	return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const TechnicianDashboard: NextPage = () => {
	const user = useReactiveVar(userVar);
	const [hoveredJob, setHoveredJob] = useState<string | null>(null);

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
		return completedBookings
			.reduce((sum: number, b: any) => sum + (parseFloat(b?.finalPrice) || 0), 0)
			.toFixed(2);
	}, [completedBookings]);

	// Real weekly earnings: bucket completed bookings into the current week (Mon–Sun)
	// by completion date, summing finalPrice. Replaces the previous hardcoded mock series.
	const earningsData = useMemo(() => {
		const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
		const week = labels.map((day) => ({ day, earnings: 0, jobs: 0 }));

		const now = new Date();
		const monday = new Date(now);
		const dow = (now.getDay() + 6) % 7; // 0 = Monday
		monday.setHours(0, 0, 0, 0);
		monday.setDate(now.getDate() - dow);
		const nextMonday = new Date(monday);
		nextMonday.setDate(monday.getDate() + 7);

		completedBookings.forEach((b: any) => {
			const when = new Date(b?.completedAt || b?.bookingDate || b?.updatedAt || b?.createdAt);
			if (Number.isNaN(when.getTime()) || when < monday || when >= nextMonday) return;
			const idx = (when.getDay() + 6) % 7;
			week[idx].earnings += parseFloat(b?.finalPrice) || 0;
			week[idx].jobs += 1;
		});

		return week;
	}, [completedBookings]);

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

	const hasEarningsData = useMemo(() => earningsData.some((d) => d.earnings > 0), [earningsData]);

	const scheduleItems = useMemo(() => {
		return [...bookings]
			.filter((b: any) => b?.bookingDate && !['CANCELLED', 'REJECTED'].includes(b?.bookingStatus))
			.sort((a: any, b: any) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime())
			.slice(0, 5);
	}, [bookings]);

	return (
		<div className="fixora-tech-dashboard">
			{/* Welcome Section */}
			<div className="fixora-tech-dashboard__welcome">
				<div>
					<div className="fixora-tech-dashboard__date">
						{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
					</div>
					<h1 className="fixora-tech-dashboard__greeting">
						Good morning, {technicianUser?.userFullName?.trim().split(/\s+/)[0] || technicianUser?.userNickname || 'Technician'} 👋
					</h1>
					<p className="fixora-tech-dashboard__info">
						You have <span className="fixora-tech-dashboard__highlight fixora-tech-dashboard__highlight--orange">{incomingRequests.length} new requests</span> and <span className="fixora-tech-dashboard__highlight fixora-tech-dashboard__highlight--green">{activeJobs.length} active jobs</span> today.
					</p>
				</div>
				<div className="fixora-tech-dashboard__quick-actions">
					<button className="fixora-tech-quick-action fixora-tech-quick-action--orange">
							<BoltOutlined style={{ fontSize: 20 }} />
							<span>New Quote</span>
						</button>
					<button className="fixora-tech-quick-action fixora-tech-quick-action--green">
							<CheckCircleOutline style={{ fontSize: 20 }} />
							<span>Mark Available</span>
						</button>
					<button className="fixora-tech-quick-action fixora-tech-quick-action--blue">
							<CalendarTodayOutlined style={{ fontSize: 19 }} />
							<span>View Schedule</span>
						</button>
					<button className="fixora-tech-quick-action fixora-tech-quick-action--purple">
							<NorthEastOutlined style={{ fontSize: 20 }} />
							<span>Export Report</span>
						</button>
				</div>
			</div>

			{/* Stats */}
			<div className="fixora-tech-dashboard__stats">
				<div className="fixora-tech-stat-card">
						<div className="fixora-tech-stat-card__top">
							<div className="fixora-tech-stat-label">Total Requests</div>
							<div className="fixora-tech-stat-icon fixora-tech-stat-icon--orange"><MailOutline style={{ fontSize: 20 }} /></div>
						</div>
						<div className="fixora-tech-stat-value">{incomingRequests.length}</div>
						<div className="fixora-tech-stat-change">
							<TrendingUpOutlined style={{ fontSize: 13 }} />
							<span className="fixora-tech-stat-change__up">+{requestsChange}</span> vs last week
						</div>
					</div>

				<div className="fixora-tech-stat-card">
						<div className="fixora-tech-stat-card__top">
							<div className="fixora-tech-stat-label">Active Jobs</div>
							<div className="fixora-tech-stat-icon fixora-tech-stat-icon--blue"><WorkOutlineOutlined style={{ fontSize: 20 }} /></div>
						</div>
						<div className="fixora-tech-stat-value">{activeJobs.length}</div>
						<div className="fixora-tech-stat-change">
							<TrendingUpOutlined style={{ fontSize: 13 }} />
							<span className="fixora-tech-stat-change__up">+{jobsChange}</span> vs last week
						</div>
					</div>

				<div className="fixora-tech-stat-card">
						<div className="fixora-tech-stat-card__top">
							<div className="fixora-tech-stat-label">This Week</div>
							<div className="fixora-tech-stat-icon fixora-tech-stat-icon--green"><AttachMoneyOutlined style={{ fontSize: 20 }} /></div>
						</div>
						<div className="fixora-tech-stat-value">${formatMoney(earnings)}</div>
						<div className="fixora-tech-stat-change">
							<TrendingUpOutlined style={{ fontSize: 13 }} />
							<span className="fixora-tech-stat-change__up">+{earningsChange}%</span> vs last week
						</div>
					</div>

				<div className="fixora-tech-stat-card">
						<div className="fixora-tech-stat-card__top">
							<div className="fixora-tech-stat-label">Avg Rating</div>
							<div className="fixora-tech-stat-icon fixora-tech-stat-icon--yellow"><StarOutlined style={{ fontSize: 20 }} /></div>
						</div>
						<div className="fixora-tech-stat-value">{rating.toFixed(1)}</div>
						<div className="fixora-tech-stat-change">
							<TrendingUpOutlined style={{ fontSize: 13 }} />
							based on {technicianUser?.reviewCount ?? 0} reviews
						</div>
					</div>
			</div>

			{/* Main Grid */}
			<div className="fixora-tech-dashboard__grid">
				{/* Incoming Requests */}
					<div className="fixora-tech-card fixora-tech-card--span-half">
						<div className="fixora-tech-card__header">
							<h2 className="fixora-tech-card__title">Incoming Requests</h2>
							<a href="/technician/requests" className="fixora-tech-card__link">View all ›</a>
						</div>
						<div className="fixora-tech-card__list">
							{incomingRequests.length > 0 ? (
								incomingRequests.slice(0, 4).map((booking: any) => {
									const ug = urgencyInfo(booking?.aiClassification?.repairComplexity, booking?.problemTitle, booking?.problemDescription);
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
													{booking?.deviceData ? `${deviceLabel(booking)} • ${booking.problemTitle || 'Device Repair'}` : (booking.problemTitle || 'Device Repair')}
												</div>
											</div>
											<div className="fixora-tech-request-meta">
												{price && <div className="fixora-tech-request-budget">{price}</div>}
												<div className="fixora-tech-request-time">{timeAgo(booking.createdAt)}</div>
											</div>
										</div>
									);
								})
							) : (
								<div className="fixora-tech-empty">No incoming requests</div>
							)}
						</div>
					</div>

				{/* Active Jobs */}
					<div className="fixora-tech-card fixora-tech-card--span-half">
						<div className="fixora-tech-card__header">
							<h2 className="fixora-tech-card__title">Active Jobs</h2>
							<a href="/technician/jobs" className="fixora-tech-card__link">View all ›</a>
						</div>
						<div className="fixora-tech-card__list">
							{activeJobs.length > 0 ? (
								activeJobs.slice(0, 3).map((booking: any) => {
									const status = jobStatusInfo(booking?.bookingStatus);
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
											<div className="fixora-tech-job-issue">{booking.problemDescription || 'Device repair'}</div>
											<div className="fixora-tech-job-progress">
												<div className="fixora-tech-progress-track">
													<div className="prog-bar" style={{ '--prog-w': `${progress}%` } as React.CSSProperties} />
												</div>
												<span className="fixora-tech-progress-value">{progress}%</span>
												<span className="fixora-tech-job-due">Due: {formatDue(booking.bookingDate, booking.createdAt)}</span>
											</div>
										</div>
									);
								})
							) : (
								<div className="fixora-tech-empty">No active jobs</div>
							)}
						</div>
					</div>

				{/* Earnings Chart */}
					<div className="fixora-tech-card fixora-tech-card--span-wide">
						<div className="fixora-tech-card__header">
							<div>
								<h2 className="fixora-tech-card__title">Weekly Earnings</h2>
								<div className="fixora-tech-earnings-info">
									<div className="fixora-tech-earnings-amount">${formatMoney(earnings)}</div>
									<div className="fixora-tech-earnings-change"><TrendingUpOutlined style={{ fontSize: 13 }} /> +{earningsChange}% vs last week</div>
								</div>
							</div>
							<div className="fixora-tech-period-toggle">
								<button className="fixora-tech-period-btn fixora-tech-period-btn--active">Week</button>
								<button className="fixora-tech-period-btn">Month</button>
								<button className="fixora-tech-period-btn">Year</button>
							</div>
						</div>
						<div style={{ height: '180px', marginTop: '16px' }}>
							{hasEarningsData ? (
								<ResponsiveContainer width="100%" height="100%">
									<AreaChart data={earningsData}>
										<defs>
											<linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
												<stop offset="0%" stopColor="#FF9A3C" stopOpacity={0.35} />
												<stop offset="60%" stopColor="#FF6B00" stopOpacity={0.08} />
												<stop offset="100%" stopColor="#FF6B00" stopOpacity={0} />
											</linearGradient>
										</defs>
										<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
										<XAxis dataKey="day" stroke="#404040" tick={{ fontSize: 11, fill: '#606060' }} axisLine={false} tickLine={false} />
										<YAxis stroke="#404040" tick={{ fontSize: 11, fill: '#606060' }} axisLine={false} tickLine={false} domain={[0, (max: number) => Math.max(Number(max) || 0, 100)]} allowDecimals={false} />
										<Tooltip
											contentStyle={{ background: '#1A1A1A', border: '1px solid rgba(255,107,0,0.2)', borderRadius: 8 }}
											labelStyle={{ color: '#A0A0A0', fontSize: 11 }}
											itemStyle={{ color: '#FF9A3C', fontSize: 13, fontWeight: 600 }}
											formatter={(v: any) => [`$${v}`, 'Earnings']}
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
									<span>No earnings recorded this week</span>
								</div>
							)}
						</div>
					</div>

				{/* Today's Schedule */}
					<div className="fixora-tech-card fixora-tech-card--span-narrow">
						<div className="fixora-tech-card__header">
							<h2 className="fixora-tech-card__title">Today's Schedule</h2>
						</div>
						<div className="fixora-tech-schedule-list">
							{scheduleItems.length > 0 ? (
								scheduleItems.map((booking: any, idx: number) => {
									const done = booking.bookingStatus === 'COMPLETED';
									const dotColor = scheduleDotColor(booking.bookingStatus);
									return (
										<div key={booking._id} className="fixora-tech-schedule-item" style={{ opacity: done ? 0.45 : 1 }}>
											<div className="fixora-tech-schedule-rail">
												<div className="fixora-tech-schedule-dot" style={{ background: done ? '#404040' : dotColor, boxShadow: done ? 'none' : `0 0 6px ${dotColor}` }} />
												{idx < scheduleItems.length - 1 && <div className="fixora-tech-schedule-line" />}
											</div>
											<div className="fixora-tech-schedule-content">
												<div className="fixora-tech-schedule-time">{formatTime(booking.bookingDate)}</div>
												<div className="fixora-tech-schedule-task" style={{ color: done ? '#606060' : '#F0F0F0' }}>{booking.problemTitle || 'Repair Task'}</div>
												<div className="fixora-tech-schedule-client">{customerName(booking)}</div>
											</div>
											{done ? (
													<CheckCircleOutline className="fixora-tech-schedule-done" style={{ fontSize: 15, color: '#22C55E' }} />
												) : (
													<AccessTimeOutlined className="fixora-tech-schedule-clock" style={{ fontSize: 15 }} />
												)}
										</div>
									);
								})
							) : (
								<div className="fixora-tech-empty">No scheduled jobs</div>
							)}
						</div>
					</div>
			</div>

			{/* Recent Reviews (full width) */}
			<div className="fixora-tech-card">
						<div className="fixora-tech-card__header">
							<h2 className="fixora-tech-card__title">Recent Reviews</h2>
							<a href="/technician/profile" className="fixora-tech-card__link">View all ›</a>
						</div>
						<div className="fixora-tech-reviews-grid">
							{reviews.length > 0 ? (
								reviews.slice(0, 3).map((review: any) => (
									<div key={review._id} className="fixora-tech-review-card">
										<div className="fixora-tech-review-header">
											<div className="fixora-tech-review-avatar">{customerInitial(review)}</div>
											<div className="fixora-tech-review-info">
												<div className="fixora-tech-review-name">{customerName(review)}</div>
												<div className="fixora-tech-review-device">Verified Customer</div>
											</div>
											<div className="fixora-tech-review-date">
												{new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
										<p className="fixora-tech-review-text">{review.reviewContent || 'Great service!'}</p>
									</div>
								))
							) : (
								<div className="fixora-tech-empty">No reviews yet</div>
							)}
						</div>
					</div>
		</div>
	);
};

export default withTechnicianLayout(TechnicianDashboard);
