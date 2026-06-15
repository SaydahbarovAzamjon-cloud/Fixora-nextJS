import React, { useMemo } from 'react';
import { NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useQuery, useReactiveVar } from '@apollo/client';
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
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);

	const { data: bookingsData } = useQuery(GET_MY_BOOKINGS, {
		skip: !user?._id,
		variables: { input: { page: 1, limit: 100 } },
		fetchPolicy: 'network-only',
	});

	const { data: userData } = useQuery(GET_USER, {
		skip: !user?._id,
		variables: { userId: user?._id },
		fetchPolicy: 'network-only',
	});

	const { data: reviewsData } = useQuery(GET_TECHNICIAN_REVIEWS, {
		skip: !user?._id,
		variables: { userId: user?._id },
		fetchPolicy: 'network-only',
	});

	const bookings = useMemo(() => bookingsData?.getMyBookings?.list ?? [], [bookingsData]);
	const technicianUser = useMemo(() => userData?.getUser ?? null, [userData]);
	const reviews = useMemo(() => reviewsData?.getTechnicianReviews ?? null, [reviewsData]);

	const incomingRequests = useMemo(() => bookings.filter(b => b?.bookingStatus === 'REQUESTED'), [bookings]);
	const activeJobs = useMemo(() => bookings.filter(b => b?.bookingStatus === 'CONFIRMED' || b?.bookingStatus === 'IN_PROGRESS'), [bookings]);
	const completedBookings = useMemo(() => bookings.filter(b => b?.bookingStatus === 'COMPLETED'), [bookings]);

	const earnings = useMemo(() => {
		return completedBookings
			.reduce((sum, b) => sum + (parseFloat(b?.finalPrice) || 0), 0)
			.toFixed(2);
	}, [completedBookings]);

	const previousEarnings = useMemo(() => {
		const lastMonth = new Date();
		lastMonth.setMonth(lastMonth.getMonth() - 1);
		return completedBookings
			.filter(b => new Date(b?.completedAt) < lastMonth)
			.reduce((sum, b) => sum + (parseFloat(b?.finalPrice) || 0), 0);
	}, [completedBookings]);

	const earningsChange = useMemo(() => {
		if (previousEarnings === 0) return 0;
		return (((parseFloat(earnings) - previousEarnings) / previousEarnings) * 100).toFixed(1);
	}, [earnings, previousEarnings]);

	const rating = useMemo(() => reviews?.averageRating ?? 0, [reviews]);
	const requestsChange = useMemo(() => {
		const lastMonth = new Date();
		lastMonth.setMonth(lastMonth.getMonth() - 1);
		const previousCount = bookings.filter(b =>
			b?.bookingStatus === 'REQUESTED' && new Date(b?.createdAt) < lastMonth
		).length;
		const currentCount = incomingRequests.length;
		if (previousCount === 0) return 0;
		return (((currentCount - previousCount) / previousCount) * 100).toFixed(0);
	}, [bookings, incomingRequests]);

	const jobsChange = useMemo(() => {
		const lastMonth = new Date();
		lastMonth.setMonth(lastMonth.getMonth() - 1);
		const previousCount = bookings.filter(b =>
			(b?.bookingStatus === 'CONFIRMED' || b?.bookingStatus === 'IN_PROGRESS') &&
			new Date(b?.createdAt) < lastMonth
		).length;
		const currentCount = activeJobs.length;
		if (previousCount === 0) return 0;
		return (((currentCount - previousCount) / previousCount) * 100).toFixed(0);
	}, [bookings, activeJobs]);

	return (
		<div className="fixora-technician-dashboard">
			<div className="fixora-technician-dashboard__header">
				<h1 className="fixora-technician-dashboard__title">
					Welcome back, {technicianUser?.userNickname || 'Technician'}! 👋
				</h1>
				<p className="fixora-technician-dashboard__subtitle">Here's your overview for today</p>
			</div>

			{/* KPI Cards */}
			<div className="fixora-technician-dashboard__kpis">
				<div className="fixora-kpi-card">
					<div className="fixora-kpi-card__icon">🔔</div>
					<div className="fixora-kpi-card__content">
						<div className="fixora-kpi-card__value">{incomingRequests.length}</div>
						<div className="fixora-kpi-card__change">
							{requestsChange > 0 ? '+' : ''}{requestsChange}% vs last month
						</div>
						<div className="fixora-kpi-card__label">Incoming Requests</div>
					</div>
				</div>

				<div className="fixora-kpi-card">
					<div className="fixora-kpi-card__icon">💼</div>
					<div className="fixora-kpi-card__content">
						<div className="fixora-kpi-card__value">{activeJobs.length}</div>
						<div className="fixora-kpi-card__change">
							{jobsChange > 0 ? '+' : ''}{jobsChange}% vs last month
						</div>
						<div className="fixora-kpi-card__label">Active Jobs</div>
					</div>
				</div>

				<div className="fixora-kpi-card">
					<div className="fixora-kpi-card__icon">💰</div>
					<div className="fixora-kpi-card__content">
						<div className="fixora-kpi-card__value">${earnings}</div>
						<div className="fixora-kpi-card__change">
							{earningsChange > 0 ? '+' : ''}{earningsChange}% vs last month
						</div>
						<div className="fixora-kpi-card__label">Earnings</div>
					</div>
				</div>

				<div className="fixora-kpi-card">
					<div className="fixora-kpi-card__icon">⭐</div>
					<div className="fixora-kpi-card__content">
						<div className="fixora-kpi-card__value">{rating.toFixed(1)}</div>
						<div className="fixora-kpi-card__change">{reviews?.metaCounter?.[0]?.total ?? 0}+ reviews</div>
						<div className="fixora-kpi-card__label">Rating</div>
					</div>
				</div>
			</div>

			{/* Main Content - Two Rows Layout */}
			<div className="fixora-technician-dashboard__sections">
				{/* First Row - Incoming Requests & Active Jobs */}
				<div className="fixora-technician-dashboard__row">
					{/* Incoming Requests Section */}
					<div className="fixora-dashboard-section fixora-dashboard-section--large">
						<div className="fixora-dashboard-section__header">
							<h2 className="fixora-dashboard-section__title">Incoming Requests ({incomingRequests.length})</h2>
							<a href="/technician/requests" className="fixora-dashboard-section__link">View all</a>
						</div>
						<div className="fixora-dashboard-section__list">
							{incomingRequests.length > 0 ? (
								incomingRequests.slice(0, 8).map((booking: any, idx: number) => (
									<div key={idx} className="fixora-request-item">
										<div className="fixora-request-item__device">
											📱 {booking?.deviceType ?? 'Device'}
										</div>
										<div className="fixora-request-item__problem">
											{booking?.problemTitle ?? 'Repair request'}
										</div>
										<div className="fixora-request-item__customer">
											{booking?.customerName ?? 'Customer'}
										</div>
										<div className="fixora-request-item__location">
											📍 {booking?.location ?? 'Location'}
										</div>
										<div className="fixora-request-item__price">
											₩{booking?.estimatedPrice ?? '0'}
										</div>
									</div>
								))
							) : (
								<div style={{ padding: '20px', color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
									No incoming requests
								</div>
							)}
						</div>
					</div>

					{/* Active Jobs Section */}
					<div className="fixora-dashboard-section fixora-dashboard-section--large">
						<div className="fixora-dashboard-section__header">
							<h2 className="fixora-dashboard-section__title">Active Jobs ({activeJobs.length})</h2>
							<a href="/technician/jobs" className="fixora-dashboard-section__link">View all</a>
						</div>
						<div className="fixora-dashboard-section__list">
							{activeJobs.length > 0 ? (
								activeJobs.slice(0, 6).map((booking: any, idx: number) => (
									<div key={idx} className="fixora-job-item">
										<div className="fixora-job-item__status">
											{booking?.bookingStatus === 'CONFIRMED' ? '⏳ Confirmed' : '⚙️ In Progress'}
										</div>
										<div className="fixora-job-item__problem">
											{booking?.problemTitle ?? 'Repair'}
										</div>
										<div className="fixora-job-item__customer">
											{booking?.customerName ?? 'Customer'}
										</div>
										<div className="fixora-job-item__date">
											📅 {new Date(booking?.bookingDate).toLocaleDateString('en-US')}
										</div>
										<div className="fixora-job-item__time">
											🕐 {new Date(booking?.bookingDate).toLocaleTimeString('en-US', {
												hour: '2-digit',
												minute: '2-digit'
											})}
										</div>
									</div>
								))
							) : (
								<div style={{ padding: '20px', color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
									No active jobs
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Second Row - Earnings, Schedule, Reviews, Actions */}
				<div className="fixora-technician-dashboard__row">
					{/* Earnings Overview Chart */}
					<div className="fixora-dashboard-section">
						<div className="fixora-dashboard-section__header">
							<h2 className="fixora-dashboard-section__title">Earnings Overview</h2>
							<select className="fixora-dashboard-section__dropdown">
								<option>This Month</option>
								<option>Last Month</option>
								<option>Last 3 Months</option>
							</select>
						</div>
						<div className="fixora-dashboard-section__chart-placeholder">
							<svg viewBox="0 0 400 200" className="fixora-chart">
								<polyline
									points="0,150 40,120 80,140 120,80 160,100 200,60 240,90 280,50 320,80 360,40"
									fill="none"
									stroke="var(--fixora-primary)"
									strokeWidth="2"
								/>
							</svg>
						</div>
					</div>

					{/* Today's Schedule */}
					<div className="fixora-dashboard-section">
						<div className="fixora-dashboard-section__header">
							<h2 className="fixora-dashboard-section__title">Today's Schedule</h2>
							<a href="/technician/jobs" className="fixora-dashboard-section__link">View all</a>
						</div>
						<div className="fixora-dashboard-section__list">
							{activeJobs.length > 0 ? (
								activeJobs.slice(0, 3).map((booking: any, idx: number) => (
									<div key={idx} className="fixora-schedule-item">
										<span className="fixora-schedule-item__time">
											{new Date(booking?.bookingDate).toLocaleTimeString('en-US', {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</span>
										<span className="fixora-schedule-item__title">{booking?.problemTitle ?? 'Repair'}</span>
										<span className="fixora-schedule-item__count">📱</span>
									</div>
								))
							) : (
								<div style={{ padding: '20px', color: 'rgba(255,255,255,0.6)' }}>No scheduled jobs for today</div>
							)}
						</div>
					</div>

					{/* Recent Reviews */}
					<div className="fixora-dashboard-section">
						<h2 className="fixora-dashboard-section__title">Recent Reviews</h2>
						<div className="fixora-dashboard-section__list">
							{reviews?.list && reviews.list.length > 0 ? (
								reviews.list.slice(0, 3).map((review: any, idx: number) => (
									<div key={idx} className="fixora-review-item">
										<div className="fixora-review-item__avatar">
											👤
										</div>
										<div className="fixora-review-item__content">
											<div className="fixora-review-item__name">Customer</div>
											<div className="fixora-review-item__rating">
												⭐ {review?.repairQuality ?? 5.0}
											</div>
										</div>
									</div>
								))
							) : (
								<div style={{ padding: '20px', color: 'rgba(255,255,255,0.6)' }}>No reviews yet</div>
							)}
						</div>
					</div>

					{/* Quick Actions */}
					<div className="fixora-dashboard-section">
						<h2 className="fixora-dashboard-section__title">Quick Actions</h2>
						<div className="fixora-dashboard-section__actions">
							<button className="fixora-action-btn">Update Availability</button>
							<button className="fixora-action-btn">Add Service</button>
							<button className="fixora-action-btn">Withdraw Earnings</button>
							<button className="fixora-action-btn">View Analytics</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default withTechnicianLayout(TechnicianDashboard);
