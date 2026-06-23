import React from 'react';
import { useTranslation } from 'next-i18next';
import type { AdminUser } from '../../../../types/admin/admin';

interface Props {
	user: AdminUser;
	bookingStats: { total: number; completed: number; cancelled: number };
	successRate: number;
	analytics: {
		completedJobsCount?: number;
		reviewCount?: number;
		averageRating?: number;
	} | null;
	clientProfile: {
		totalBookings?: number;
		completedBookings?: number;
		reviewsWritten?: number;
	} | null;
	techReviews: { _id: string; reviewContent?: string; createdAt: string }[];
	loading?: boolean;
}

const AdminUserPerformance: React.FC<Props> = ({
	user,
	bookingStats,
	successRate,
	analytics,
	clientProfile,
	techReviews,
	loading,
}) => {
	const { t } = useTranslation('admin');

	const totalBookings = user.userType === 'TECHNICIAN' ? bookingStats.total : clientProfile?.totalBookings ?? bookingStats.total;
	const completed =
		user.userType === 'TECHNICIAN' ? bookingStats.completed : clientProfile?.completedBookings ?? bookingStats.completed;

	return (
		<section id="performance" className="fixora-admin-user-section">
			<h3 className="fixora-admin-user-section__title">{t('userDetail.sections.performance')}</h3>
			{loading && <p className="fixora-admin-muted">{t('common.loading')}</p>}
			<div className="fixora-admin-stat-grid">
				<div className="fixora-admin-stat-grid__item">
					<span className="fixora-admin-stat-grid__label">{t('userDetail.performance.totalBookings')}</span>
					<strong>{totalBookings}</strong>
				</div>
				<div className="fixora-admin-stat-grid__item">
					<span className="fixora-admin-stat-grid__label">{t('userDetail.performance.completed')}</span>
					<strong>{completed}</strong>
				</div>
				<div className="fixora-admin-stat-grid__item">
					<span className="fixora-admin-stat-grid__label">{t('userDetail.performance.cancelled')}</span>
					<strong>{bookingStats.cancelled}</strong>
				</div>
				<div className="fixora-admin-stat-grid__item">
					<span className="fixora-admin-stat-grid__label">{t('userDetail.performance.successRate')}</span>
					<strong>{successRate}%</strong>
				</div>
				<div className="fixora-admin-stat-grid__item">
					<span className="fixora-admin-stat-grid__label">{t('userDetail.performance.rating')}</span>
					<strong>{(analytics?.averageRating ?? user.averageRating)?.toFixed(1) ?? '0.0'}</strong>
				</div>
				<div className="fixora-admin-stat-grid__item">
					<span className="fixora-admin-stat-grid__label">{t('userDetail.performance.reviews')}</span>
					<strong>{analytics?.reviewCount ?? user.reviewCount ?? 0}</strong>
				</div>
				<div className="fixora-admin-stat-grid__item">
					<span className="fixora-admin-stat-grid__label">{t('userDetail.performance.followers')}</span>
					<strong>{user.followersCount ?? 0}</strong>
				</div>
				<div className="fixora-admin-stat-grid__item">
					<span className="fixora-admin-stat-grid__label">{t('userDetail.performance.following')}</span>
					<strong>{user.followingCount ?? 0}</strong>
				</div>
			</div>

			{user.userType === 'TECHNICIAN' && techReviews.length > 0 && (
				<>
					<h4 className="fixora-admin-user-section__subtitle">{t('userDetail.performance.recentReviews')}</h4>
					<ul className="fixora-admin-user-list">
						{techReviews.slice(0, 5).map((review) => (
							<li key={review._id} className="fixora-admin-user-list__item">
								<p>{review.reviewContent || '—'}</p>
								<time>{new Date(review.createdAt).toLocaleDateString()}</time>
							</li>
						))}
					</ul>
				</>
			)}
		</section>
	);
};

export default AdminUserPerformance;
