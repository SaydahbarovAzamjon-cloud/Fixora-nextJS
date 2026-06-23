import React, { useMemo, useState } from 'react';

import { NextPage } from 'next';

import { useTranslation } from 'next-i18next';

import { useQuery } from '@apollo/client';

import { useRouter } from 'next/router';

import {

	Users,

	ShieldCheck,

	Clock,

	CalendarDays,

	CircleDollarSign,

	Flag,

} from 'lucide-react';

import {

	Bar,

	CartesianGrid,

	ComposedChart,

	Line,

	ResponsiveContainer,

	Tooltip,

	XAxis,

	YAxis,

	PieChart,

	Pie,

	Cell,

} from 'recharts';

import withAdminLayout from '../../libs/components/layout/AdminLayout';

import { adminPageProps } from '../../libs/i18n/adminPageProps';

import AdminHeader from '../../libs/components/admin/AdminHeader';

import AdminStatCard from '../../libs/components/admin/shared/AdminStatCard';
import AdminSelect from '../../libs/components/admin/shared/AdminSelect';
import AdminUserBadgeStack from '../../libs/components/admin/users/AdminUserBadgeStack';

import {

	GET_ADMIN_DASHBOARD_STATS,

	GET_ADMIN_RECENT_ACTIVITY,

	GET_TECHNICIAN_VERIFICATION_QUEUE,

} from '../../apollo/admin/query';

import { displayUserName } from '../../libs/hooks/useUserLookup';

import { BOOKING_STATUSES, useBookingStatusCounts } from '../../libs/hooks/useBookingStatusCounts';

import { dateLocale } from '../../libs/utils/i18nLocale';

import { formatKrw } from '../../libs/utils/formatCurrency';

import { ADMIN_CHART_COLORS, ADMIN_CHART_THEME } from '../../libs/utils/adminBadges';

import type { AdminActivityItem, AdminDashboardPeriod, AdminMonthlyPoint, AdminUser } from '../../libs/types/admin/admin';

const formatTrend = (pct: number) => {

	const sign = pct >= 0 ? '+' : '';

	return `${sign}${pct.toFixed(1)}%`;

};

const chartTooltipStyle = {

	backgroundColor: ADMIN_CHART_THEME.tooltipBg,

	border: `1px solid ${ADMIN_CHART_THEME.tooltipBorder}`,

	borderRadius: 12,

	fontSize: 12,

};

const AdminDashboardPage: NextPage = () => {

	const { t } = useTranslation('admin');

	const router = useRouter();

	const [period, setPeriod] = useState<AdminDashboardPeriod>('MONTH');

	const { data: statsData, loading: statsLoading } = useQuery(GET_ADMIN_DASHBOARD_STATS, {

		variables: { period },

		fetchPolicy: 'cache-and-network',

	});

	const { data: activityData, loading: activityLoading } = useQuery(GET_ADMIN_RECENT_ACTIVITY, {

		variables: { limit: 12 },

		fetchPolicy: 'cache-and-network',

	});

	const { data: verificationData } = useQuery(GET_TECHNICIAN_VERIFICATION_QUEUE, {

		variables: { input: { page: 1, limit: 5, search: { verificationStatus: 'UNDER_REVIEW' } } },

		fetchPolicy: 'cache-and-network',

	});

	const stats = statsData?.getAdminDashboardStats;

	const activity: AdminActivityItem[] = activityData?.getAdminRecentActivity ?? [];

	const pendingList: AdminUser[] = verificationData?.getTechnicianVerificationQueue?.list ?? [];

	const statusCounts = useBookingStatusCounts();

	const chartData = useMemo(

		() =>

			(stats?.monthlySeries ?? []).map((point: AdminMonthlyPoint) => ({

				month: point.month.slice(5),

				revenue: point.revenue,

				bookings: point.bookings,

			})),

		[stats?.monthlySeries],

	);

	const pieData = BOOKING_STATUSES.map((status) => ({

		name: t(`bookings.status.${status}`),

		value: statusCounts[status],

	})).filter((d) => d.value > 0);

	const pieTotal = pieData.reduce((sum, d) => sum + d.value, 0);

	return (

		<>

			<AdminHeader title={t('dashboard.title')} subtitle={t('dashboard.subtitle')} />

			<div className="fixora-admin-page">

				<div className="fixora-admin-toolbar-row">
					<AdminSelect
						value={period}
						onChange={(e) => setPeriod(e.target.value as AdminDashboardPeriod)}
						options={[
							{ value: 'MONTH', label: t('dashboard.period.month') },
							{ value: 'QUARTER', label: t('dashboard.period.quarter') },
							{ value: 'YEAR', label: t('dashboard.period.year') },
						]}
						aria-label={t('dashboard.period.month')}
					/>
				</div>

				<div className="fixora-admin-stats-grid">

					<AdminStatCard

						icon={<Users size={18} />}

						label={t('dashboard.stats.totalUsers')}

						value={(stats?.totalUsers.value ?? 0).toLocaleString()}

						subtext={formatTrend(stats?.totalUsers.trendPercent ?? 0)}

						iconTone="primary"

					/>

					<AdminStatCard

						icon={<ShieldCheck size={18} />}

						label={t('dashboard.stats.totalTechnicians')}

						value={(stats?.totalTechnicians.value ?? 0).toLocaleString()}

						subtext={t('dashboard.stats.verified', { count: stats?.totalTechnicians.verifiedCount ?? 0 })}

						iconTone="success"

					/>

					<AdminStatCard

						icon={<Clock size={18} />}

						label={t('dashboard.stats.pendingVerifications')}

						value={(stats?.pendingVerifications.value ?? 0).toLocaleString()}

						subtext={formatTrend(stats?.pendingVerifications.trendPercent ?? 0)}

						iconTone="warning"

					/>

					<AdminStatCard

						icon={<CalendarDays size={18} />}

						label={t('dashboard.stats.totalBookings')}

						value={(stats?.totalBookings.value ?? 0).toLocaleString()}

						subtext={t('dashboard.stats.active', { count: stats?.totalBookings.activeCount ?? 0 })}

						iconTone="info"

					/>

					<AdminStatCard

						icon={<CircleDollarSign size={18} />}

						label={t('dashboard.stats.platformRevenue')}

						value={formatKrw(stats?.platformRevenue.value ?? 0)}

						subtext={formatTrend(stats?.platformRevenue.trendPercent ?? 0)}

						iconTone="primary"

					/>

					<AdminStatCard

						icon={<Flag size={18} />}

						label={t('dashboard.stats.openReports')}

						value={(stats?.openReports.value ?? 0).toLocaleString()}

						subtext={t('dashboard.stats.critical', { count: stats?.openReports.criticalCount ?? 0 })}

						iconTone="danger"

					/>

				</div>

				<div className="fixora-admin-charts-grid">

					<div className="fixora-admin-chart-card">

						<div className="fixora-admin-chart-card__header">

							<div>

								<h3 className="fixora-admin-chart-card__title">{t('dashboard.charts.revenueBookings')}</h3>

								<p className="fixora-admin-chart-card__sub">{t('dashboard.charts.revenueBookingsSub')}</p>

							</div>

							<div className="fixora-admin-chart-card__legend">

								<span>

									<i className="fixora-admin-chart-card__dot fixora-admin-chart-card__dot--accent" />

									{t('dashboard.charts.revenue')}

								</span>

								<span>

									<i className="fixora-admin-chart-card__dot fixora-admin-chart-card__dot--primary" />

									{t('dashboard.charts.bookings')}

								</span>

							</div>

						</div>

						{statsLoading && (

							<div className="fixora-admin-empty fixora-admin-empty--chart">{t('common.loading')}</div>

						)}

						{!statsLoading && chartData.length === 0 && (

							<div className="fixora-admin-empty fixora-admin-empty--chart">{t('dashboard.charts.noData')}</div>

						)}

						{!statsLoading && chartData.length > 0 && (

							<ResponsiveContainer width="100%" height={220}>

								<ComposedChart data={chartData}>

									<CartesianGrid strokeDasharray="3 3" stroke={ADMIN_CHART_THEME.grid} />

									<XAxis dataKey="month" tick={{ fill: ADMIN_CHART_THEME.tick, fontSize: 11 }} />

									<YAxis yAxisId="left" tick={{ fill: ADMIN_CHART_THEME.tick, fontSize: 11 }} />

									<YAxis yAxisId="right" orientation="right" tick={{ fill: ADMIN_CHART_THEME.tick, fontSize: 11 }} />

									<Tooltip contentStyle={chartTooltipStyle} />

									<Bar yAxisId="left" dataKey="revenue" fill={ADMIN_CHART_THEME.bar} radius={[4, 4, 0, 0]} />

									<Line

										yAxisId="right"

										type="monotone"

										dataKey="bookings"

										stroke={ADMIN_CHART_THEME.line}

										strokeWidth={2}

										dot={false}

									/>

								</ComposedChart>

							</ResponsiveContainer>

						)}

					</div>

					<div className="fixora-admin-chart-card">

						<div className="fixora-admin-chart-card__header">

							<div>

								<h3 className="fixora-admin-chart-card__title">{t('dashboard.charts.byStatus')}</h3>

								<p className="fixora-admin-chart-card__sub">{t('dashboard.charts.total', { count: pieTotal })}</p>

							</div>

						</div>

						{pieData.length > 0 ? (

							<ResponsiveContainer width="100%" height={220}>

								<PieChart>

									<Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>

										{pieData.map((_, index) => (

											<Cell key={index} fill={ADMIN_CHART_COLORS[index % ADMIN_CHART_COLORS.length]} />

										))}

									</Pie>

									<Tooltip contentStyle={chartTooltipStyle} />

								</PieChart>

							</ResponsiveContainer>

						) : (

							<div className="fixora-admin-empty">{t('dashboard.charts.noData')}</div>

						)}

					</div>

				</div>

				<div className="fixora-admin-two-col">

					<div className="fixora-admin-card">

						<div className="fixora-admin-card__header">

							<div>

								<h3 className="fixora-admin-card__title">{t('dashboard.pendingVerifications.title')}</h3>

								<p className="fixora-admin-card__sub">

									{t('dashboard.pendingVerifications.subtitle', {

										count: stats?.pendingVerifications.value ?? pendingList.length,

									})}

								</p>

							</div>

							<button

								type="button"

								className="fixora-admin-btn fixora-admin-btn--outline fixora-admin-btn--sm"

								onClick={() => router.push('/_admin/verification')}

							>

								{t('dashboard.pendingVerifications.viewAll')}

							</button>

						</div>

						{pendingList.length === 0 ? (

							<div className="fixora-admin-empty">{t('dashboard.pendingVerifications.empty')}</div>

						) : (

							pendingList.map((tech) => (

								<div key={tech._id} className="fixora-admin-list-row">

									<div className="fixora-admin-list-row__main">

										<div className="fixora-admin-table-user__avatar">{displayUserName(tech).charAt(0)}</div>

										<div className="fixora-admin-list-row__body">

											<div className="fixora-admin-table-user__name">{displayUserName(tech)}</div>

											<div className="fixora-admin-verification__list-meta">

												{tech.shopName} · {tech.specialty}

											</div>
											<AdminUserBadgeStack user={tech} compact />

										</div>

									</div>

									<button

										type="button"

										className="fixora-admin-btn fixora-admin-btn--outline fixora-admin-btn--sm"

										onClick={() => router.push('/_admin/verification')}

									>

										{t('dashboard.pendingVerifications.review')}

									</button>

								</div>

							))

						)}

					</div>

					<div className="fixora-admin-card">

						<h3 className="fixora-admin-card__title">{t('dashboard.recentActivity.title')}</h3>

						<p className="fixora-admin-card__sub">{t('dashboard.recentActivity.subtitle')}</p>

						{activityLoading && <div className="fixora-admin-empty">{t('common.loading')}</div>}

						{!activityLoading && activity.length === 0 && (

							<div className="fixora-admin-empty">{t('dashboard.recentActivity.empty')}</div>

						)}

						{activity.map((item, i) => (

							<div key={`${item.entityId}-${i}`} className="fixora-admin-activity-entry">

								<div className="fixora-admin-activity-entry__message">{item.message}</div>

								<div className="fixora-admin-activity-entry__meta">

									{item.actorName ? `${item.actorName} · ` : ''}

									{new Date(item.createdAt).toLocaleString(dateLocale(router.locale))}

								</div>

							</div>

						))}

					</div>

				</div>

			</div>

		</>

	);

};

export const getServerSideProps = adminPageProps;

export default withAdminLayout(AdminDashboardPage, { title: 'Dashboard' });

