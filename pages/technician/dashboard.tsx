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

	const incomingRequests = useMemo(() => bookings.filter(b => b?.bookingStatus === 'REQUESTED').length, [bookings]);
	const activeJobs = useMemo(() => bookings.filter(b => b?.bookingStatus === 'CONFIRMED' || b?.bookingStatus === 'IN_PROGRESS').length, [bookings]);
	const earnings = useMemo(() => {
		return bookings
			.filter(b => b?.bookingStatus === 'COMPLETED')
			.reduce((sum, b) => sum + (parseFloat(b?.finalPrice) || 0), 0)
			.toFixed(2);
	}, [bookings]);
	const rating = useMemo(() => reviews?.averageRating ?? 0, [reviews]);

	return (
		<div className="fixora-technician-dashboard">
			<div className="fixora-technician-dashboard__header">
				<h1 className="fixora-technician-dashboard__title">Welcome back! 👋</h1>
				<p className="fixora-technician-dashboard__subtitle">Here's your overview for today</p>
			</div>

			{/* KPI Cards */}
			<div className="fixora-technician-dashboard__kpis">
				<div className="fixora-kpi-card">
					<div className="fixora-kpi-card__icon">🔔</div>
					<div className="fixora-kpi-card__content">
						<div className="fixora-kpi-card__value">{incomingRequests}</div>
						<div className="fixora-kpi-card__change">{bookings.length > 0 ? 'Active' : 'No requests'}</div>
						<div className="fixora-kpi-card__label">Incoming Requests</div>
					</div>
				</div>

				<div className="fixora-kpi-card">
					<div className="fixora-kpi-card__icon">💼</div>
					<div className="fixora-kpi-card__content">
						<div className="fixora-kpi-card__value">{activeJobs}</div>
						<div className="fixora-kpi-card__change">{activeJobs > 0 ? 'In progress' : 'None'}</div>
						<div className="fixora-kpi-card__label">Active Jobs</div>
					</div>
				</div>

				<div className="fixora-kpi-card">
					<div className="fixora-kpi-card__icon">💰</div>
					<div className="fixora-kpi-card__content">
						<div className="fixora-kpi-card__value">${earnings}</div>
						<div className="fixora-kpi-card__change">Total earnings</div>
						<div className="fixora-kpi-card__label">Earnings</div>
					</div>
				</div>

				<div className="fixora-kpi-card">
					<div className="fixora-kpi-card__icon">⭐</div>
					<div className="fixora-kpi-card__content">
						<div className="fixora-kpi-card__value">{rating.toFixed(1)}</div>
						<div className="fixora-kpi-card__change">{reviews?.reviewCount ?? 0}+ reviews</div>
						<div className="fixora-kpi-card__label">Rating</div>
					</div>
				</div>
			</div>

			{/* Main Content Grid */}
			<div className="fixora-technician-dashboard__grid">
				{/* Left Column */}
				<div className="fixora-technician-dashboard__left">
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
							<a href="/technician/jobs" className="fixora-dashboard-section__link">
								View All Jobs
							</a>
						</div>
						<div className="fixora-dashboard-section__list">
							{activeJobs > 0 ? (
								bookings
									.filter(b => b?.bookingStatus === 'CONFIRMED' || b?.bookingStatus === 'IN_PROGRESS')
									.slice(0, 3)
									.map((booking: any, idx: number) => (
										<div key={idx} className="fixora-schedule-item">
											<span className="fixora-schedule-item__time">
												{new Date(booking?.bookingDate).toLocaleTimeString('en-US', {
													hour: '2-digit',
													minute: '2-digit',
												})}
											</span>
											<span className="fixora-schedule-item__title">{booking?.problemTitle ?? 'Repair'}</span>
											<span className="fixora-schedule-item__count">1</span>
										</div>
									))
							) : (
								<div style={{ padding: '20px', color: 'rgba(255,255,255,0.6)' }}>No scheduled jobs for today</div>
							)}
						</div>
					</div>
				</div>

				{/* Right Column */}
				<div className="fixora-technician-dashboard__right">
					{/* Recent Reviews */}
					<div className="fixora-dashboard-section">
						<h2 className="fixora-dashboard-section__title">Recent Reviews</h2>
						<div className="fixora-dashboard-section__list">
							{reviews?.reviews && reviews.reviews.length > 0 ? (
								reviews.reviews.slice(0, 3).map((review: any, idx: number) => (
									<div key={idx} className="fixora-review-item">
										<div className="fixora-review-item__avatar">
											{(review.reviewerName ?? 'U')
												.split(' ')
												.map((word: string) => word[0])
												.join('')
												.toUpperCase()
												.slice(0, 2)}
										</div>
										<div className="fixora-review-item__content">
											<div className="fixora-review-item__name">{review.reviewerName ?? 'Unknown'}</div>
											<div className="fixora-review-item__rating">⭐ {review.overallRating ?? 5.0}</div>
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
