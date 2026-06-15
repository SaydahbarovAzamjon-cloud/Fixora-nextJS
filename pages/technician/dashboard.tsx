import React, { useMemo } from 'react';
import { NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useQuery, useReactiveVar } from '@apollo/client';
import withTechnicianLayout from '../../libs/components/layout/TechnicianLayout';
import DashboardBookingCard from '../../libs/components/technician/DashboardBookingCard';
import { GET_MY_BOOKINGS } from '../../apollo/user/profile';
import { GET_USER, GET_TECHNICIAN_REVIEWS } from '../../apollo/user/query';
import { userVar } from '../../apollo/store';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	},
});

const TechnicianDashboard: NextPage = () => {
	useTranslation('common');
	const user = useReactiveVar(userVar);

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
				limit: 10,
				sort: 'createdAt',
				direction: 'DESC',
				search: { technicianId: user?._id ?? '' },
			},
		},
		fetchPolicy: 'network-only',
	});

	const bookings = useMemo(() => bookingsData?.getMyBookings?.list ?? [], [bookingsData]);
	const technicianUser = useMemo(() => userData?.getUser ?? null, [userData]);
	const reviews = useMemo(() => reviewsData?.getTechnicianReviews ?? null, [reviewsData]);

	const incomingRequests = useMemo(() => bookings.filter((b: any) => b?.bookingStatus === 'REQUESTED'), [bookings]);
	const activeJobs = useMemo(() => bookings.filter((b: any) => b?.bookingStatus === 'CONFIRMED' || b?.bookingStatus === 'IN_PROGRESS'), [bookings]);
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
			b?.bookingStatus === 'REQUESTED' && new Date(b?.createdAt) < lastMonth
		).length;
		const currentCount = incomingRequests.length;
		if (previousCount === 0) return 0;
		return (((currentCount - previousCount) / previousCount) * 100).toFixed(0);
	}, [bookings, incomingRequests]);

	const jobsChange = useMemo(() => {
		const lastMonth = new Date();
		lastMonth.setMonth(lastMonth.getMonth() - 1);
		const previousCount = bookings.filter((b: any) =>
			(b?.bookingStatus === 'CONFIRMED' || b?.bookingStatus === 'IN_PROGRESS') &&
			new Date(b?.createdAt) < lastMonth
		).length;
		const currentCount = activeJobs.length;
		if (previousCount === 0) return 0;
		return (((currentCount - previousCount) / previousCount) * 100).toFixed(0);
	}, [bookings, activeJobs]);

	const [hoveredJob, setHoveredJob] = React.useState<string | null>(null);

	return (
		<div className="fixora-tech-dashboard">
			{/* Welcome Section */}
			<div className="fixora-tech-dashboard__welcome">
				<div>
					<div className="fixora-tech-dashboard__date">Monday, June 15, 2026</div>
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
								incomingRequests.slice(0, 4).map((booking: any, idx: number) => (
									<DashboardBookingCard
										key={idx}
										booking={booking}
										technicianLocation={technicianUser?.userLocation}
										variant="request"
									/>
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
								activeJobs.slice(0, 3).map((booking: any, idx: number) => (
									<div
										key={idx}
										className="fixora-tech-job-item"
										onMouseEnter={() => setHoveredJob(booking._id)}
										onMouseLeave={() => setHoveredJob(null)}
										style={{
											borderRadius: '10px',
											padding: '14px',
											background: hoveredJob === booking._id ? 'rgba(255,255,255,0.03)' : 'transparent',
											border: hoveredJob === booking._id ? '1px solid rgba(255,107,0,0.15)' : '1px solid transparent',
											marginBottom: idx < activeJobs.length - 1 ? '8px' : 0,
											transition: 'all 0.15s ease',
											cursor: 'pointer',
										}}
									>
										<DashboardBookingCard
											booking={booking}
											technicianLocation={technicianUser?.userLocation}
											variant="job"
										/>
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
						<div style={{
							height: '180px',
							marginTop: '16px',
							display: 'flex',
							alignItems: 'flex-end',
							gap: '8px',
							paddingBottom: '16px',
						}}>
							{earningsData.map((d, i) => (
								<div
									key={i}
									style={{
										flex: 1,
										height: `${(d.earnings / 800) * 100}%`,
										background: 'linear-gradient(180deg, #FF6B00 0%, #FF9A3C 100%)',
										borderRadius: '4px 4px 0 0',
										boxShadow: '0 0 8px rgba(255,107,0,0.5)',
										position: 'relative',
										minHeight: '20px',
									}}
									title={`${d.day}: $${d.earnings}`}
								/>
							))}
						</div>
						<div style={{
							display: 'flex',
							justifyContent: 'space-between',
							paddingTop: '8px',
							borderTop: '1px solid rgba(255,255,255,0.07)',
						}}>
							{earningsData.map((d) => (
								<div key={d.day} style={{
									flex: 1,
									textAlign: 'center',
									color: '#606060',
									fontSize: '11px',
									fontWeight: 500,
								}}>{d.day}</div>
							))}
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
									<div key={idx} className="fixora-tech-schedule-item">
										<div className="fixora-tech-schedule-dot" style={{ background: '#FF6B00' }} />
										<div className="fixora-tech-schedule-content">
											<div className="fixora-tech-schedule-time">
												{new Date(booking?.bookingDate).toLocaleTimeString('en-US', {
													hour: '2-digit',
													minute: '2-digit',
												})}
											</div>
											<div className="fixora-tech-schedule-task">{booking?.problemTitle ?? 'Repair Task'}</div>
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
							{reviews?.list && reviews.list.length > 0 ? (
								reviews.list.slice(0, 3).map((review: any, idx: number) => (
									<div key={idx} className="fixora-tech-review-card">
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
											{'⭐'.repeat(review.repairQuality || 5)}
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
