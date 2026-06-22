import React from 'react';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import StarIcon from '@mui/icons-material/Star';
import { GET_USER_REVIEWS } from '../../../apollo/user/query';
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

const CustomerReviewsSection = ({ userId }: CustomerReviewsSectionProps) => {
	const { t } = useTranslation('common');

	const { data, loading } = useQuery(GET_USER_REVIEWS, {
		variables: {
			input: {
				page: 1,
				limit: 50,
				search: { userId },
			},
		},
		skip: !userId,
		fetchPolicy: 'cache-and-network',
	});

	const reviews: CustomerReview[] = (data?.getUserReviews?.list ?? []).map(
		(review: TechnicianReview & { technicianData?: { shopName?: string; userNickname?: string; userFullName?: string } }) => ({
			...review,
			technicianName:
				review.technicianData?.shopName ||
				review.technicianData?.userFullName ||
				review.technicianData?.userNickname ||
				'',
		}),
	);

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
