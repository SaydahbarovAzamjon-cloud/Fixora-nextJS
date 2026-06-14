import React, { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useQuery, useReactiveVar } from '@apollo/client';
import withTechnicianLayout from '../../libs/components/layout/TechnicianLayout';
import { userVar } from '../../apollo/store';

export const getServerSideProps = async ({ locale }: { locale?: string }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	},
});

const TechnicianDashboard: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const user = useReactiveVar(userVar);

	useEffect(() => {
		if (!user?._id) {
			router.push('/').then();
		}
	}, [user]);

	return (
		<div className="fixora-technician-dashboard">
			<div className="fixora-technician-dashboard__header">
				<h1 className="fixora-technician-dashboard__title">Welcome back, {user?.userNickname}! 👋</h1>
				<p className="fixora-technician-dashboard__subtitle">Here's your overview for today</p>
			</div>

			{/* KPI Cards */}
			<div className="fixora-technician-dashboard__kpis">
				<div className="fixora-kpi-card">
					<div className="fixora-kpi-card__icon">🔔</div>
					<div className="fixora-kpi-card__content">
						<div className="fixora-kpi-card__value">12</div>
						<div className="fixora-kpi-card__change">+20% vs last month</div>
						<div className="fixora-kpi-card__label">Incoming Requests</div>
					</div>
				</div>

				<div className="fixora-kpi-card">
					<div className="fixora-kpi-card__icon">💼</div>
					<div className="fixora-kpi-card__content">
						<div className="fixora-kpi-card__value">6</div>
						<div className="fixora-kpi-card__change">+10% vs last month</div>
						<div className="fixora-kpi-card__label">Active Jobs</div>
					</div>
				</div>

				<div className="fixora-kpi-card">
					<div className="fixora-kpi-card__icon">💰</div>
					<div className="fixora-kpi-card__content">
						<div className="fixora-kpi-card__value">$1,250</div>
						<div className="fixora-kpi-card__change">+15% vs last month</div>
						<div className="fixora-kpi-card__label">Earnings</div>
					</div>
				</div>

				<div className="fixora-kpi-card">
					<div className="fixora-kpi-card__icon">⭐</div>
					<div className="fixora-kpi-card__content">
						<div className="fixora-kpi-card__value">4.9</div>
						<div className="fixora-kpi-card__change">210+ reviews</div>
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
							<a href="#" className="fixora-dashboard-section__link">
								View Full Calendar
							</a>
						</div>
						<div className="fixora-dashboard-section__list">
							<div className="fixora-schedule-item">
								<span className="fixora-schedule-item__time">10:30 AM</span>
								<span className="fixora-schedule-item__title">iPhone 13 Screen Repair</span>
								<span className="fixora-schedule-item__count">1</span>
							</div>
							<div className="fixora-schedule-item">
								<span className="fixora-schedule-item__time">02:00 PM</span>
								<span className="fixora-schedule-item__title">MacBook S3 Battery</span>
								<span className="fixora-schedule-item__count">1</span>
							</div>
							<div className="fixora-schedule-item">
								<span className="fixora-schedule-item__time">04:30 PM</span>
								<span className="fixora-schedule-item__title">Water Damage - iPhone</span>
								<span className="fixora-schedule-item__count">1</span>
							</div>
						</div>
					</div>
				</div>

				{/* Right Column */}
				<div className="fixora-technician-dashboard__right">
					{/* Recent Reviews */}
					<div className="fixora-dashboard-section">
						<h2 className="fixora-dashboard-section__title">Recent Reviews</h2>
						<div className="fixora-dashboard-section__list">
							<div className="fixora-review-item">
								<div className="fixora-review-item__avatar">JD</div>
								<div className="fixora-review-item__content">
									<div className="fixora-review-item__name">John D.</div>
									<div className="fixora-review-item__rating">⭐ 5.0</div>
								</div>
							</div>
							<div className="fixora-review-item">
								<div className="fixora-review-item__avatar">SR</div>
								<div className="fixora-review-item__content">
									<div className="fixora-review-item__name">Sarah L.</div>
									<div className="fixora-review-item__rating">⭐ 5.0</div>
								</div>
							</div>
							<div className="fixora-review-item">
								<div className="fixora-review-item__avatar">MK</div>
								<div className="fixora-review-item__content">
									<div className="fixora-review-item__name">Michael K.</div>
									<div className="fixora-review-item__rating">⭐ 4.5</div>
								</div>
							</div>
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
