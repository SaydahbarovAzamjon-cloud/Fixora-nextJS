import React, { useEffect, useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import StarIcon from '@mui/icons-material/Star';
import { GET_TECHNICIANS, GET_TECHNICIAN_REVIEWS } from '../../../apollo/user/query';
import { TechnicianReview } from '../../types/fixora/fixora';

interface CustomerReview extends TechnicianReview {
	technicianId: string;
	technicianName?: string;
}

interface CustomerReviewsSectionProps {
	userId: string;
}

const averageScore = (review: TechnicianReview) =>
	((review.repairQuality + review.repairSpeed + review.communication) / 3).toFixed(1);

const TECH_SCAN_LIMIT = 40;
const REVIEWS_PER_TECH = 30;

/**
 * Public customer reviews — backend has no getUserReviews yet.
 * Scans technician review lists and filters by review.userId (BIZ-05).
 */
const CustomerReviewsSection = ({ userId }: CustomerReviewsSectionProps) => {
	const { t } = useTranslation('common');
	const client = useApolloClient();
	const [reviews, setReviews] = useState<CustomerReview[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;

		const load = async () => {
			setLoading(true);
			try {
				const techRes = await client.query({
					query: GET_TECHNICIANS,
					variables: { input: { page: 1, limit: TECH_SCAN_LIMIT, search: { isOnline: null } } },
					fetchPolicy: 'network-only',
				});
				const technicians: { _id: string; shopName?: string; userNickname?: string; userFullName?: string }[] =
					techRes.data?.getTechnicians?.list ?? [];

				const found: CustomerReview[] = [];

				await Promise.all(
					technicians.map(async (tech) => {
						try {
							const res = await client.query({
								query: GET_TECHNICIAN_REVIEWS,
								variables: {
									input: {
										page: 1,
										limit: REVIEWS_PER_TECH,
										sort: 'createdAt',
										direction: 'DESC',
										search: { technicianId: tech._id },
									},
								},
								fetchPolicy: 'network-only',
							});
							const list: (TechnicianReview & { userId?: string; technicianId?: string })[] =
								res.data?.getTechnicianReviews?.list ?? [];
							const techName = tech.shopName || tech.userFullName || tech.userNickname || '';
							list.forEach((review) => {
								if (review.userId === userId) {
									found.push({ ...review, technicianId: tech._id, technicianName: techName });
								}
							});
						} catch {
							/* skip technician on error */
						}
					}),
				);

				if (!cancelled) {
					found.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
					setReviews(found);
				}
			} catch {
				if (!cancelled) setReviews([]);
			} finally {
				if (!cancelled) setLoading(false);
			}
		};

		if (userId) load();
		return () => {
			cancelled = true;
		};
	}, [userId, client]);

	if (loading) {
		return <p className="fixora-member__loading-inline">{t('common.loading', 'Loading...')}</p>;
	}

	if (!reviews.length) {
		return (
			<p className="fixora-member__empty-section">
				{t('member.noReviews', 'No reviews yet. Reviews appear after a completed repair booking.')}
			</p>
		);
	}

	return (
		<ul className="fixora-member__reviews">
			{reviews.map((review) => (
				<li key={review._id} className="fixora-member__review-card">
					<div className="fixora-member__review-head">
						<span className="fixora-member__review-score">
							<StarIcon fontSize="inherit" />
							{averageScore(review)}
						</span>
						<time>{new Date(review.createdAt).toLocaleDateString()}</time>
					</div>
					{review.technicianName && (
						<p className="fixora-member__review-tech">
							{t('member.reviewedShop', 'Reviewed')}{' '}
							<Link href={`/technicians/${review.technicianId}`}>{review.technicianName}</Link>
						</p>
					)}
					{review.reviewContent && <p className="fixora-member__review-text">{review.reviewContent}</p>}
				</li>
			))}
		</ul>
	);
};

export default CustomerReviewsSection;
