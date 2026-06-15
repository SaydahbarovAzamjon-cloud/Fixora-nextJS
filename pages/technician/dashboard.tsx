import React, { useMemo, useState } from 'react';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useQuery, useReactiveVar } from '@apollo/client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import withTechnicianLayout from '../../libs/components/layout/TechnicianLayout';
import { GET_MY_BOOKINGS } from '../../apollo/user/profile';
import { GET_USER, GET_TECHNICIAN_REVIEWS } from '../../apollo/user/query';
import { userVar } from '../../apollo/store';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	},
});

const TechnicianDashboard: NextPage = () => {
	const user = useReactiveVar(userVar);
	const [hoveredJob, setHoveredJob] = useState<string | null>(null);

	const { data: bookingsData } = useQuery(GET_MY_BOOKINGS, {
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
				limit: 5,
				sort: 'createdAt',
				direction: 'DESC',
				search: { technicianId: user?._id ?? '' },
			},
		},
		fetchPolicy: 'network-only',
	});

	const bookings = useMemo(() => bookingsData?.getMyBookings?.list ?? [], [bookingsData]);
	const technicianUser = useMemo(() => userData?.getUser ?? null, [userData]);
	const reviews = useMemo(() => reviewsData?.getTechnicianReviews?.list ?? [], [reviewsData]);

	const incomingRequests = useMemo(() => bookings.filter((b: any) => b?.bookingStatus === 'PENDING'), [bookings]);
	const activeJobs = useMemo(() => bookings.filter((b: any) => ['ACCEPTED', 'IN_PROGRESS'].includes(b?.bookingStatus)), [bookings]);
	const completedBookings = useMemo(() => bookings.filter((b: any) => b?.bookingStatus === 'COMPLETED'), [bookings]);

	const earnings = useMemo(() => {
		return completedBookings
			.reduce((sum: number, b: any) => sum + (parseFloat(b?.finalPrice) || 0), 0)
			.toFixed(2);
	}, [completedBookings]);

	const earningsData = [
		{ day: 'Mon', earnings: 320, jobs: 3 },
		{ day: 'Tue', earnings: 480, jobs: 5 },
		{ day: 'Wed', earnings: 240, jobs: 2 },
		{ day: 'Thu', earnings: 620, jobs: 6 },
		{ day: 'Fri', earnings: 780, jobs: 8 },
		{ day: 'Sat', earnings: 540, jobs: 5 },
		{ day: 'Sun', earnings: 160, jobs: 2 },
	];

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
		const previousCount = bookings.filter((b: any) =>
			b?.bookingStatus === 'PENDING' && new Date(b?.createdAt) < lastMonth
		).length;
		if (previousCount === 0) return 0;
		return (((incomingRequests.length - previousCount) / previousCount) * 100).toFixed(0);
	}, [bookings, incomingRequests]);

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

	return (
		<div className="fixora-tech-dashboard">
			{/* Welcome Section */}
			<div className="fixora-tech-dashboard__welcome">
				<div>
					<div className="fixora-tech-dashboard__date">
						{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
					</div>
					<h1 className="fixora-tech-dashboard__greeting">
						Good morning, {technicianUser?.userNickname || 'Alex'} 👋
					</h1>
					<p className="fixora-tech-dashboard__info">
						You have <span className="fixora-tech-dashboard__highlight fixora-tech-dashboard__highlight--orange">{incomingRequests.length} new requests</span> and <span className="fixora-tech-dashboard__highlight fixora-tech-dashboard__highlight--green">{activeJobs.length} active jobs</span> today.
					</p>
				</div>
				<div className="fixora-tech-dashboard__quick-actions">
					<button className="fixora-tech-quick-action">⚡ New Quote</button>
					<button className="fixora-tech-quick-action">✓ Mark Available</button>
					<button className="fixora-tech-quick-action">📅 View Schedule</button>
					<button className="fixora-tech-quick-action">📤 Export Report</button>
				</div>
			</div>

			{/* Stats */}
			<div className="fixora-tech-dashboard__stats">
				<div className="fixora-tech-stat-card">
					<div className="fixora-tech-stat-icon fixora-tech-stat-icon--orange">📬</div>
					<div>
						<div className="fixora-tech-stat-label">Total Requests</div>
						<div className="fixora-tech-stat-value">{incomingRequests.length}</div>
						<div className="fixora-tech-stat-change">+{requestsChange}% vs last week</div>
					</div>
				</div>

				<div className="fixora-tech-stat-card">
					<div className="fixora-tech-stat-icon fixora-tech-stat-icon--blue">💼</div>
					<div>
						<div className="fixora-tech-stat-label">Active Jobs</div>
						<div className="fixora-tech-stat-value">{activeJobs.length}</div>
						<div className="fixora-tech-stat-change">+{jobsChange}% vs last week</div>
					</div>
				</div>

				<div className="fixora-tech-stat-card">
					<div className="fixora-tech-stat-icon fixora-tech-stat-icon--green">💵</div>
					<div>
						<div className="fixora-tech-stat-label">This Week</div>
						<div className="fixora-tech-stat-value">${earnings}</div>
						<div className="fixora-tech-stat-change">+{earningsChange}% vs last week</div>
					</div>
				</div>

				<div className="fixora-tech-stat-card">
					<div className="fixora-tech-stat-icon fixora-tech-stat-icon--yellow">⭐</div>
					<div>
						<div className="fixora-tech-stat-label">Avg Rating</div>
						<div className="fixora-tech-stat-value">{rating.toFixed(1)}</div>
						<div className="fixora-tech-stat-change">+0.2 vs last week</div>
					</div>
				</div>
			</div>

			{/* Main Grid */}
			<div className="fixora-tech-dashboard__grid">
				{/* Left Column */}
				<div className="fixora-tech-dashboard__left">
					{/* Incoming Requests */}
					<div className="fixora-tech-card">
						<div className="fixora-tech-card__header">
							<h2 className="fixora-tech-card__title">Incoming Requests</h2>
							<a href="/technician/requests" className="fixora-tech-card__link">View all ›</a>
						</div>
						<div className="fixora-tech-card__list">
							{incomingRequests.length > 0 ? (
								incomingRequests.slice(0, 4).map((booking: any) => (
									<div key={booking._id} style={{
										padding: '12px 4px',
										borderBottom: '1px solid rgba(255,255,255,0.05)',
										cursor: 'pointer',
										borderRadius: 8,
										transition: 'background 0.15s',
									}}
										onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)'; }}
										onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
									>
										<div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
											<div style={{ width: 36, height: 36, borderRadius: 10, background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
												📱
											</div>
											<div style={{ flex: 1, minWidth: 0 }}>
												<div style={{ color: '#E0E0E0', fontSize: 13, fontWeight: 600 }}>Customer</div>
												<div style={{ color: '#606060', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
													{booking.problemTitle || 'Device Repair'}
												</div>
											</div>
											<div style={{ textAlign: 'right', flexShrink: 0 }}>
												<div style={{ color: '#FF6B00', fontSize: 13, fontWeight: 700 }}>$0</div>
												<div style={{ color: '#505050', fontSize: 11 }}>now</div>
											</div>
										</div>
									</div>
								))
							) : (
								<div className="fixora-tech-empty">No incoming requests</div>
							)}
						</div>
					</div>

					{/* Active Jobs */}
					<div className="fixora-tech-card">
						<div className="fixora-tech-card__header">
							<h2 className="fixora-tech-card__title">Active Jobs</h2>
							<a href="/technician/jobs" className="fixora-tech-card__link">View all ›</a>
						</div>
						<div className="fixora-tech-card__list">
							{activeJobs.length > 0 ? (
								activeJobs.slice(0, 3).map((booking: any) => (
									<div
										key={booking._id}
										className="fixora-tech-job-item"
										onMouseEnter={() => setHoveredJob(booking._id)}
										onMouseLeave={() => setHoveredJob(null)}
										style={{
											borderRadius: '10px',
											padding: '14px',
											background: hoveredJob === booking._id ? 'rgba(255,255,255,0.03)' : 'transparent',
											border: hoveredJob === booking._id ? '1px solid rgba(255,107,0,0.15)' : '1px solid transparent',
											marginBottom: '8px',
											transition: 'all 0.15s ease',
											cursor: 'pointer',
										}}
									>
										<div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
											<div style={{ display: 'flex', gap: 10 }}>
												<div style={{ width: 34, height: 34, borderRadius: 9, background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
													💼
												</div>
												<div>
													<div style={{ color: '#E0E0E0', fontSize: 13, fontWeight: 600 }}>Customer</div>
													<div style={{ color: '#606060', fontSize: 12 }}>{booking.problemTitle || 'Repair'}</div>
												</div>
											</div>
											<span style={{ background: 'rgba(255,107,0,0.12)', color: '#FF6B00', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20 }}>In Progress</span>
										</div>
										<div style={{ color: '#707070', fontSize: 12, marginBottom: 8 }}>Device repair</div>
										<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
											<div style={{ flex: 1, height: 5, background: '#1E1E1E', borderRadius: 4, overflow: 'hidden' }}>
												<div style={{ width: '65%', height: '100%', background: 'linear-gradient(90deg, #FF4500 0%, #FF6B00 25%, #FFCC00 50%, #FF6B00 75%, #FF4500 100%)', boxShadow: '0 0 8px rgba(255,107,0,0.5)' }} />
											</div>
											<span style={{ color: '#FF9A3C', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>65%</span>
											<span style={{ color: '#505050', fontSize: 11, flexShrink: 0 }}>Due: Today</span>
										</div>
									</div>
								))
							) : (
								<div className="fixora-tech-empty">No active jobs</div>
							)}
						</div>
					</div>
				</div>

				{/* Right Column */}
				<div className="fixora-tech-dashboard__right">
					{/* Earnings Chart */}
					<div className="fixora-tech-card">
						<div className="fixora-tech-card__header">
							<div>
								<h2 className="fixora-tech-card__title">Weekly Earnings</h2>
								<div className="fixora-tech-earnings-info">
									<div className="fixora-tech-earnings-amount">$3,240</div>
									<div className="fixora-tech-earnings-change">+18% vs last week</div>
								</div>
							</div>
							<div className="fixora-tech-period-toggle">
								<button className="fixora-tech-period-btn fixora-tech-period-btn--active">Week</button>
								<button className="fixora-tech-period-btn">Month</button>
								<button className="fixora-tech-period-btn">Year</button>
							</div>
						</div>
						<div style={{ height: '180px', marginTop: '16px' }}>
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
									<YAxis stroke="#404040" tick={{ fontSize: 11, fill: '#606060' }} axisLine={false} tickLine={false} />
									<Tooltip
										contentStyle={{ background: '#1A1A1A', border: '1px solid rgba(255,107,0,0.2)', borderRadius: 8 }}
										labelStyle={{ color: '#A0A0A0', fontSize: 11 }}
										itemStyle={{ color: '#FF9A3C', fontSize: 13, fontWeight: 600 }}
										formatter={(v: number) => [`$${v}`, 'Earnings']}
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
						</div>
					</div>

					{/* Today's Schedule */}
					<div className="fixora-tech-card">
						<div className="fixora-tech-card__header">
							<h2 className="fixora-tech-card__title">Today's Schedule</h2>
						</div>
						<div className="fixora-tech-schedule-list">
							{activeJobs.length > 0 ? (
								activeJobs.slice(0, 3).map((booking: any, idx: number) => (
									<div key={booking._id} className="fixora-tech-schedule-item">
										<div className="fixora-tech-schedule-dot" style={{ background: '#FF6B00' }} />
										<div className="fixora-tech-schedule-content">
											<div className="fixora-tech-schedule-time">
												{new Date(booking?.bookingDate).toLocaleTimeString('en-US', {
													hour: '2-digit',
													minute: '2-digit',
												})}
											</div>
											<div className="fixora-tech-schedule-task">{booking?.problemTitle || 'Repair Task'}</div>
										</div>
									</div>
								))
							) : (
								<div className="fixora-tech-empty">No scheduled jobs</div>
							)}
						</div>
					</div>

					{/* Recent Reviews */}
					<div className="fixora-tech-card">
						<div className="fixora-tech-card__header">
							<h2 className="fixora-tech-card__title">Recent Reviews</h2>
							<a href="/technician/profile" className="fixora-tech-card__link">View all ›</a>
						</div>
						<div className="fixora-tech-reviews-grid">
							{reviews.length > 0 ? (
								reviews.slice(0, 3).map((review: any, idx: number) => (
									<div key={review._id} className="fixora-tech-review-card">
										<div className="fixora-tech-review-header">
											<div className="fixora-tech-review-avatar">
												{review.userId?.userNickname?.[0] || 'C'}
											</div>
											<div className="fixora-tech-review-info">
												<div className="fixora-tech-review-name">{review.userId?.userNickname || 'Customer'}</div>
												<div className="fixora-tech-review-device">Repair Service</div>
											</div>
											<div className="fixora-tech-review-date">Today</div>
										</div>
										<div className="fixora-tech-review-stars">
											{'⭐'.repeat(Math.round(review.repairQuality || 5))}
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
			</div>
		</div>
	);
};

export default withTechnicianLayout(TechnicianDashboard);
